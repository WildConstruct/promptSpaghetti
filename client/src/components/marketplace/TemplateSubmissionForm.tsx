// Epic 16.2.1 Template Submission Form Component
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TemplateSubmissionForm.css';

interface SubmissionData {
  title: string;
  description: string;
  tags: string[];
  categories: string[];
  price_cents: number;
  is_ai_generated: boolean;
  claude_compat: string[];
  claude_model: string;
  graph_json: Record<string, any>;
  prompt_yaml?: string;
  changelog_md?: string;
  token_per_run_estimate: number;
  intended_use_cases: string[];
  technical_requirements: string[];
  example_outputs: string[];
  documentation_md?: string;
  moderation_notes?: string;
  is_first_submission: boolean;
  previous_version_id?: string;
}

interface ValidationResult {
  id: string;
  rule_id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: Record<string, any>;
  suggested_fix?: string;
  auto_fixable: boolean;
  location?: {
    field?: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface TemplateSubmissionFormProps {
  templateId?: string;
  onSubmit?: (submissionId: string) => void;
  onCancel?: () => void;
}

const CLAUDE_MODELS = [
  'claude-3-sonnet',
  'claude-3-haiku',
  'claude-3-opus',
  'claude-3.5-sonnet'
];

const DEFAULT_SUBMISSION_DATA: SubmissionData = {
  title: '',
  description: '',
  tags: [],
  categories: [],
  price_cents: 0,
  is_ai_generated: false,
  claude_compat: ['claude-3-sonnet'],
  claude_model: 'claude-3-sonnet',
  graph_json: {},
  token_per_run_estimate: 0,
  intended_use_cases: [''],
  technical_requirements: [],
  example_outputs: [''],
  is_first_submission: true
};

export const TemplateSubmissionForm: React.FC<TemplateSubmissionFormProps> = ({
  templateId,
  onSubmit,
  onCancel
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [submissionData, setSubmissionData] = useState<SubmissionData>(DEFAULT_SUBMISSION_DATA);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDraft, setIsDraft] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [graphJsonString, setGraphJsonString] = useState('{}');
  const [tagInput, setTagInput] = useState('');

  const totalSteps = 4;

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchSubmission(id);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/marketplace/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSubmission = async (submissionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/marketplace/submissions/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const submission = await response.json();
        setSubmissionData(submission.submission_data);
        setValidationResults(submission.validation_results || []);
        setIsDraft(submission.status === 'draft');
        setSubmissionId(submission.id);
        setGraphJsonString(JSON.stringify(submission.submission_data.graph_json, null, 2));
      }
    } catch (error) {
      console.error('Failed to fetch submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SubmissionData, value: any) => {
    setSubmissionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: keyof SubmissionData, index: number, value: string) => {
    const array = [...(submissionData[field] as string[])];
    array[index] = value;
    setSubmissionData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const addArrayItem = (field: keyof SubmissionData) => {
    const array = [...(submissionData[field] as string[])];
    array.push('');
    setSubmissionData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const removeArrayItem = (field: keyof SubmissionData, index: number) => {
    const array = [...(submissionData[field] as string[])];
    array.splice(index, 1);
    setSubmissionData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!submissionData.tags.includes(tagInput.trim())) {
        handleInputChange('tags', [...submissionData.tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', submissionData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleGraphJsonChange = (value: string) => {
    setGraphJsonString(value);
    try {
      const parsed = JSON.parse(value);
      handleInputChange('graph_json', parsed);
    } catch (error) {
      // Invalid JSON, don't update the submission data
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors = validationResults.filter(r => r.severity === 'error');
    
    switch (currentStep) {
    case 1: // Basic Info
      return !errors.some(e => 
        e.location?.field && ['title', 'description', 'tags', 'categories'].includes(e.location.field)
      );
    case 2: // Technical Details
      return !errors.some(e => 
        e.location?.field && ['graph_json', 'claude_model', 'token_per_run_estimate'].includes(e.location.field)
      );
    case 3: // Content Details
      return !errors.some(e => 
        e.location?.field && ['intended_use_cases', 'example_outputs'].includes(e.location.field)
      );
    case 4: // Review
      return errors.length === 0;
    default:
      return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      await saveDraft();
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveDraft = async () => {
    try {
      setIsLoading(true);
      const payload = {
        template_id: templateId,
        submission_data: submissionData
      };

      const url = submissionId 
        ? `/api/marketplace/submissions/${submissionId}`
        : '/api/marketplace/submissions';
      
      const method = submissionId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        if (!submissionId) {
          setSubmissionId(result.id);
        }
        setValidationResults(result.validation_results || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save draft:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!submissionId) {
      const success = await saveDraft();
      if (!success) return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/marketplace/submissions/${submissionId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setIsDraft(false);
        if (onSubmit) {
          onSubmit(submissionId);
        } else {
          navigate('/marketplace/submissions');
        }
      }
    } catch (error) {
      console.error('Failed to submit for review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderValidationResults = () => {
    if (validationResults.length === 0) return null;

    const errors = validationResults.filter(r => r.severity === 'error');
    const warnings = validationResults.filter(r => r.severity === 'warning');

    return (
      <div className="validation-results">
        {errors.length > 0 && (
          <div className="validation-errors">
            <h4>Errors (must be fixed)</h4>
            {errors.map(error => (
              <div key={error.id} className="validation-error">
                <span className="error-icon">⚠️</span>
                <div>
                  <p>{error.message}</p>
                  {error.suggested_fix && (
                    <p className="suggested-fix">💡 {error.suggested_fix}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="validation-warnings">
            <h4>Warnings (recommended to fix)</h4>
            {warnings.map(warning => (
              <div key={warning.id} className="validation-warning">
                <span className="warning-icon">⚠️</span>
                <div>
                  <p>{warning.message}</p>
                  {warning.suggested_fix && (
                    <p className="suggested-fix">💡 {warning.suggested_fix}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="step-content">
      <h3>Basic Information</h3>
      
      <div className="form-group">
        <label htmlFor="title">Template Title *</label>
        <input
          id="title"
          type="text"
          value={submissionData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter a descriptive title for your template"
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={submissionData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe what your template does and how it can be used"
          rows={4}
          maxLength={2000}
        />
        <small>{submissionData.description.length}/2000 characters</small>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags *</label>
        <div className="tags-container">
          <div className="tags-list">
            {submissionData.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
          </div>
          <input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Type a tag and press Enter"
          />
        </div>
        <small>Add relevant tags to help users find your template</small>
      </div>

      <div className="form-group">
        <label htmlFor="categories">Categories *</label>
        <div className="categories-grid">
          {categories.map(category => (
            <label key={category.id} className="category-option">
              <input
                type="checkbox"
                checked={submissionData.categories.includes(category.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange('categories', [...submissionData.categories, category.id]);
                  } else {
                    handleInputChange('categories', submissionData.categories.filter(c => c !== category.id));
                  }
                }}
              />
              <span className="category-name">{category.name}</span>
              {category.description && (
                <small className="category-description">{category.description}</small>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="price">Price (USD)</label>
        <input
          id="price"
          type="number"
          value={submissionData.price_cents / 100}
          onChange={(e) => handleInputChange('price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
          step="0.01"
          min="0"
          max="1000"
        />
        <small>Leave as 0 for free templates</small>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={submissionData.is_ai_generated}
            onChange={(e) => handleInputChange('is_ai_generated', e.target.checked)}
          />
          This template was generated using AI
        </label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h3>Technical Details</h3>
      
      <div className="form-group">
        <label htmlFor="claude_model">Claude Model *</label>
        <select
          id="claude_model"
          value={submissionData.claude_model}
          onChange={(e) => handleInputChange('claude_model', e.target.value)}
        >
          {CLAUDE_MODELS.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="claude_compat">Claude Compatibility *</label>
        <div className="claude-compat-options">
          {CLAUDE_MODELS.map(model => (
            <label key={model} className="checkbox-label">
              <input
                type="checkbox"
                checked={submissionData.claude_compat.includes(model)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange('claude_compat', [...submissionData.claude_compat, model]);
                  } else {
                    handleInputChange('claude_compat', submissionData.claude_compat.filter(m => m !== model));
                  }
                }}
              />
              {model}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="graph_json">Graph JSON *</label>
        <textarea
          id="graph_json"
          value={graphJsonString}
          onChange={(e) => handleGraphJsonChange(e.target.value)}
          placeholder="Paste your graph JSON here"
          rows={10}
          className="code-textarea"
        />
        <small>Valid JSON representing your template's graph structure</small>
      </div>

      <div className="form-group">
        <label htmlFor="prompt_yaml">Prompt YAML (Optional)</label>
        <textarea
          id="prompt_yaml"
          value={submissionData.prompt_yaml || ''}
          onChange={(e) => handleInputChange('prompt_yaml', e.target.value)}
          placeholder="Optional YAML configuration for prompts"
          rows={6}
          className="code-textarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="token_estimate">Token Per Run Estimate</label>
        <input
          id="token_estimate"
          type="number"
          value={submissionData.token_per_run_estimate}
          onChange={(e) => handleInputChange('token_per_run_estimate', parseInt(e.target.value || '0'))}
          min="0"
          placeholder="Estimated tokens per execution"
        />
        <small>Approximate number of tokens this template will use per run</small>
      </div>

      <div className="form-group">
        <label htmlFor="technical_requirements">Technical Requirements</label>
        {submissionData.technical_requirements.map((req, index) => (
          <div key={index} className="array-input">
            <input
              type="text"
              value={req}
              onChange={(e) => handleArrayInputChange('technical_requirements', index, e.target.value)}
              placeholder="e.g., Requires image upload capability"
            />
            <button type="button" onClick={() => removeArrayItem('technical_requirements', index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('technical_requirements')}>
          Add Requirement
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h3>Content Details</h3>
      
      <div className="form-group">
        <label htmlFor="intended_use_cases">Intended Use Cases *</label>
        {submissionData.intended_use_cases.map((useCase, index) => (
          <div key={index} className="array-input">
            <input
              type="text"
              value={useCase}
              onChange={(e) => handleArrayInputChange('intended_use_cases', index, e.target.value)}
              placeholder="e.g., Blog post generation, Marketing copy"
            />
            {submissionData.intended_use_cases.length > 1 && (
              <button type="button" onClick={() => removeArrayItem('intended_use_cases', index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('intended_use_cases')}>
          Add Use Case
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="example_outputs">Example Outputs *</label>
        {submissionData.example_outputs.map((output, index) => (
          <div key={index} className="array-input">
            <textarea
              value={output}
              onChange={(e) => handleArrayInputChange('example_outputs', index, e.target.value)}
              placeholder="Show an example of what this template generates"
              rows={3}
            />
            {submissionData.example_outputs.length > 1 && (
              <button type="button" onClick={() => removeArrayItem('example_outputs', index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('example_outputs')}>
          Add Example
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="documentation">Documentation (Optional)</label>
        <textarea
          id="documentation"
          value={submissionData.documentation_md || ''}
          onChange={(e) => handleInputChange('documentation_md', e.target.value)}
          placeholder="Provide detailed documentation for your template (Markdown supported)"
          rows={6}
        />
      </div>

      <div className="form-group">
        <label htmlFor="changelog">Changelog (Optional)</label>
        <textarea
          id="changelog"
          value={submissionData.changelog_md || ''}
          onChange={(e) => handleInputChange('changelog_md', e.target.value)}
          placeholder="Describe changes in this version"
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="moderation_notes">Notes for Moderators (Optional)</label>
        <textarea
          id="moderation_notes"
          value={submissionData.moderation_notes || ''}
          onChange={(e) => handleInputChange('moderation_notes', e.target.value)}
          placeholder="Any additional information for the review team"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h3>Review & Submit</h3>
      
      <div className="submission-summary">
        <h4>Submission Summary</h4>
        <div className="summary-item">
          <strong>Title:</strong> {submissionData.title}
        </div>
        <div className="summary-item">
          <strong>Price:</strong> ${(submissionData.price_cents / 100).toFixed(2)}
        </div>
        <div className="summary-item">
          <strong>Categories:</strong> {submissionData.categories.length} selected
        </div>
        <div className="summary-item">
          <strong>Tags:</strong> {submissionData.tags.join(', ')}
        </div>
        <div className="summary-item">
          <strong>Claude Model:</strong> {submissionData.claude_model}
        </div>
        <div className="summary-item">
          <strong>Token Estimate:</strong> {submissionData.token_per_run_estimate}
        </div>
      </div>

      {renderValidationResults()}

      {validationResults.filter(r => r.severity === 'error').length === 0 && (
        <div className="ready-to-submit">
          <h4>✅ Ready to Submit</h4>
          <p>Your template has passed all validation checks and is ready for review.</p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="submission-form loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="submission-form">
      <div className="submission-header">
        <h2>{submissionId ? 'Edit Submission' : 'Submit New Template'}</h2>
        <div className="step-indicator">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      <div className="form-container">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      <div className="form-actions">
        {currentStep > 1 && (
          <button type="button" onClick={handlePrevious} className="btn-secondary">
            Previous
          </button>
        )}
        
        <button type="button" onClick={saveDraft} className="btn-outline" disabled={isLoading}>
          Save Draft
        </button>
        
        {currentStep < totalSteps ? (
          <button 
            type="button" 
            onClick={handleNext}
            className="btn-primary"
            disabled={!validateCurrentStep()}
          >
            Next
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleSubmitForReview}
            className="btn-primary"
            disabled={validationResults.some(r => r.severity === 'error') || isLoading}
          >
            Submit for Review
          </button>
        )}
        
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateSubmissionForm;