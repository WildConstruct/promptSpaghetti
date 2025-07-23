/**
 * Contribution UI Components - Epic 16 Marketplace & Community Features
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 * 
 * Comprehensive contribution interface with error handling,
 * form validation, and user experience optimization.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Upload, 
  Save, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Star,
  ThumbsUp,
  MessageSquare,
  Share2,
  Flag,
  Edit,
  Trash2,
  Eye,
  Clock,
  User
} from 'lucide-react';

// Types with comprehensive validation
export interface ContributionFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // minutes
  prerequisites: string[];
  resources: Array<{
    type: 'link' | 'file' | 'image' | 'video';
    url: string;
    title: string;
  }>;
  license: 'cc0' | 'cc-by' | 'cc-by-sa' | 'proprietary';
}

export interface ContributionItem {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
  category: string;
  tags: string[];
  difficulty: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  reviewCount: number;
  downloadCount: number;
  comments: number;
}

// Error types for comprehensive error handling
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ContributionError {
  type: 'validation' | 'network' | 'permission' | 'server' | 'unknown';
  message: string;
  details?: string;
  field?: string;
  code?: string;
}

// Security and validation utilities
export class ContributionValidator {
  static validateTitle(title: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (!title || title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Title is required',
        code: 'REQUIRED'
      });
    }
    
    if (title.length > 200) {
      errors.push({
        field: 'title',
        message: 'Title must be less than 200 characters',
        code: 'MAX_LENGTH'
      });
    }
    
    // Security: Check for malicious content
    if (/<script|javascript:|data:|eval\(/i.test(title)) {
      errors.push({
        field: 'title',
        message: 'Title contains potentially dangerous content',
        code: 'SECURITY_VIOLATION'
      });
    }
    
    return errors;
  }
  
  static validateDescription(description: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (!description || description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Description is required',
        code: 'REQUIRED'
      });
    }
    
    if (description.length < 50) {
      errors.push({
        field: 'description',
        message: 'Description must be at least 50 characters',
        code: 'MIN_LENGTH'
      });
    }
    
    if (description.length > 2000) {
      errors.push({
        field: 'description',
        message: 'Description must be less than 2000 characters',
        code: 'MAX_LENGTH'
      });
    }
    
    return errors;
  }
  
  static validateContent(content: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (!content || content.trim().length === 0) {
      errors.push({
        field: 'content',
        message: 'Content is required',
        code: 'REQUIRED'
      });
    }
    
    if (content.length < 100) {
      errors.push({
        field: 'content',
        message: 'Content must be at least 100 characters',
        code: 'MIN_LENGTH'
      });
    }
    
    if (content.length > 50000) {
      errors.push({
        field: 'content',
        message: 'Content exceeds maximum length (50,000 characters)',
        code: 'MAX_LENGTH'
      });
    }
    
    // Security checks
    const scriptTags = (content.match(/<script/gi) || []).length;
    if (scriptTags > 0) {
      errors.push({
        field: 'content',
        message: 'Script tags are not allowed in content',
        code: 'SECURITY_VIOLATION'
      });
    }
    
    return errors;
  }
  
  static validateTags(tags: string[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (tags.length === 0) {
      errors.push({
        field: 'tags',
        message: 'At least one tag is required',
        code: 'REQUIRED'
      });
    }
    
    if (tags.length > 10) {
      errors.push({
        field: 'tags',
        message: 'Maximum 10 tags allowed',
        code: 'MAX_COUNT'
      });
    }
    
    tags.forEach((tag, index) => {
      if (tag.length > 30) {
        errors.push({
          field: `tags[${index}]`,
          message: 'Each tag must be less than 30 characters',
          code: 'MAX_LENGTH'
        });
      }
      
      if (!/^[a-zA-Z0-9\-_\s]+$/.test(tag)) {
        errors.push({
          field: `tags[${index}]`,
          message: 'Tags can only contain letters, numbers, hyphens, and underscores',
          code: 'INVALID_FORMAT'
        });
      }
    });
    
    return errors;
  }
  
  static validateFormData(formData: ContributionFormData): ValidationError[] {
    const errors: ValidationError[] = [];
    
    errors.push(...this.validateTitle(formData.title));
    errors.push(...this.validateDescription(formData.description));
    errors.push(...this.validateContent(formData.content));
    errors.push(...this.validateTags(formData.tags));
    
    // Validate estimated time
    if (formData.estimatedTime <= 0 || formData.estimatedTime > 600) {
      errors.push({
        field: 'estimatedTime',
        message: 'Estimated time must be between 1 and 600 minutes',
        code: 'INVALID_RANGE'
      });
    }
    
    // Validate category
    if (!formData.category || formData.category.trim().length === 0) {
      errors.push({
        field: 'category',
        message: 'Category is required',
        code: 'REQUIRED'
      });
    }
    
    return errors;
  }
}

// Error boundary component for robust error handling
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class ContributionErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ errorInfo });
    
    // Log error for monitoring
    console.error('ContributionErrorBoundary caught an error:', error, errorInfo);
    
    // Call parent error handler if provided
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="error-boundary">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Main contribution form component
export interface ContributionFormProps {
  initialData?: Partial<ContributionFormData>;
  onSubmit: (data: ContributionFormData) => Promise<{ success: boolean; error?: ContributionError }>;
  onSaveDraft?: (data: ContributionFormData) => Promise<{ success: boolean; error?: ContributionError }>;
  isLoading?: boolean;
  className?: string;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({
  initialData = {},
  onSubmit,
  onSaveDraft,
  isLoading = false,
  className = ''
}) => {
  // Form state with comprehensive initialization
  const [formData, setFormData] = useState<ContributionFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    content: initialData.content || '',
    category: initialData.category || '',
    tags: initialData.tags || [],
    difficulty: initialData.difficulty || 'beginner',
    estimatedTime: initialData.estimatedTime || 60,
    prerequisites: initialData.prerequisites || [],
    resources: initialData.resources || [],
    license: initialData.license || 'cc-by'
  });

  // Error state management
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<ContributionError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  // Auto-save draft functionality
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Validation state
  const validationErrors = useMemo(() => {
    return ContributionValidator.validateFormData(formData);
  }, [formData]);

  // Auto-save draft every 30 seconds if there are changes
  useEffect(() => {
    if (onSaveDraft && !isSubmitting && !isDraftSaving) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      const timer = setTimeout(async () => {
        try {
          setIsDraftSaving(true);
          await onSaveDraft(formData);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsDraftSaving(false);
        }
      }, 30000);

      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [formData, onSaveDraft, isSubmitting, isDraftSaving]);

  // Form update handlers with error handling
  const updateFormData = useCallback((field: keyof ContributionFormData, value: any) => {
    try {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Clear specific field errors when user makes changes
      setErrors(prev => prev.filter(error => error.field !== field));
      setSubmitError(null);
    } catch (error) {
      console.error('Error updating form data:', error);
    }
  }, []);

  // Tag management with validation
  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    
    if (!trimmedTag) return;
    
    if (formData.tags.includes(trimmedTag)) {
      setErrors(prev => [...prev, {
        field: 'tags',
        message: 'Tag already exists',
        code: 'DUPLICATE'
      }]);
      return;
    }
    
    if (formData.tags.length >= 10) {
      setErrors(prev => [...prev, {
        field: 'tags',
        message: 'Maximum 10 tags allowed',
        code: 'MAX_COUNT'
      }]);
      return;
    }
    
    updateFormData('tags', [...formData.tags, trimmedTag]);
  }, [formData.tags, updateFormData]);

  const removeTag = useCallback((index: number) => {
    updateFormData('tags', formData.tags.filter((_, i) => i !== index));
  }, [formData.tags, updateFormData]);

  // Submit handler with comprehensive error handling
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setErrors([]);

      // Validate form data
      const validationErrors = ContributionValidator.validateFormData(formData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Submit to parent component
      const result = await onSubmit(formData);
      
      if (!result.success && result.error) {
        setSubmitError(result.error);
      }
      
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError({
        type: 'unknown',
        message: 'An unexpected error occurred while submitting',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  // Save draft handler
  const handleSaveDraft = useCallback(async () => {
    if (!onSaveDraft) return;
    
    try {
      setIsDraftSaving(true);
      const result = await onSaveDraft(formData);
      
      if (result.success) {
        setLastSaved(new Date());
      } else if (result.error) {
        setSubmitError(result.error);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      setSubmitError({
        type: 'unknown',
        message: 'Failed to save draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsDraftSaving(false);
    }
  }, [formData, onSaveDraft]);

  // Error display component
  const ErrorDisplay = ({ error }: { error: ContributionError }) => (
    <div className="error-display bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-2">
        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-red-800 font-medium">{error.message}</h4>
          {error.details && (
            <p className="text-red-600 text-sm mt-1">{error.details}</p>
          )}
          {error.code && (
            <p className="text-red-500 text-xs mt-1">Error Code: {error.code}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Field error display
  const getFieldError = (fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName);
  };

  const renderFieldError = (fieldName: string) => {
    const error = getFieldError(fieldName);
    if (!error) return null;
    
    return (
      <div className="field-error text-red-600 text-sm mt-1 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1" />
        {error.message}
      </div>
    );
  };

  return (
    <ContributionErrorBoundary>
      <form onSubmit={handleSubmit} className={`contribution-form ${className}`}>
        {/* Global error display */}
        {submitError && <ErrorDisplay error={submitError} />}
        
        {/* Auto-save indicator */}
        <div className="auto-save-indicator mb-4 text-sm text-gray-600 flex items-center">
          {isDraftSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Saving draft...
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </>
          ) : (
            <Clock className="h-4 w-4 mr-1" />
          )}
        </div>

        <div className="form-sections space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="form-field">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className={getFieldError('title') ? 'border-red-500' : ''}
                  placeholder="Enter a descriptive title for your contribution"
                  maxLength={200}
                  required
                />
                {renderFieldError('title')}
                <div className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 characters
                </div>
              </div>

              {/* Description */}
              <div className="form-field">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className={`w-full p-3 border rounded-lg resize-vertical min-h-[100px] ${
                    getFieldError('description') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Provide a detailed description of your contribution"
                  maxLength={2000}
                  required
                />
                {renderFieldError('description')}
                <div className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/2000 characters
                </div>
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-field">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                    className={`w-full p-3 border rounded-lg ${
                      getFieldError('category') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="template">Template</option>
                    <option value="tool">Tool</option>
                    <option value="guide">Guide</option>
                    <option value="resource">Resource</option>
                    <option value="example">Example</option>
                  </select>
                  {renderFieldError('category')}
                </div>

                <div className="form-field">
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => updateFormData('difficulty', e.target.value as any)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="form-field">
                <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Time (minutes)
                </label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => updateFormData('estimatedTime', parseInt(e.target.value) || 0)}
                  className={getFieldError('estimatedTime') ? 'border-red-500' : ''}
                  min={1}
                  max={600}
                  placeholder="60"
                />
                {renderFieldError('estimatedTime')}
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="form-field">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Main Content *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => updateFormData('content', e.target.value)}
                  className={`w-full p-3 border rounded-lg resize-vertical min-h-[300px] ${
                    getFieldError('content') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter the main content of your contribution. Use markdown formatting for better presentation."
                  maxLength={50000}
                  required
                />
                {renderFieldError('content')}
                <div className="text-xs text-gray-500 mt-1">
                  {formData.content.length}/50000 characters • Markdown supported
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="form-field">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags * (Press Enter to add)
                </label>
                <div className="tag-input-container">
                  <Input
                    placeholder="Add tags..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className={getFieldError('tags') ? 'border-red-500' : ''}
                  />
                  <div className="tags-display mt-2 flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="tag-badge cursor-pointer"
                        onClick={() => removeTag(index)}
                      >
                        {tag}
                        <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  {renderFieldError('tags')}
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.tags.length}/10 tags
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* License */}
          <Card>
            <CardHeader>
              <CardTitle>License</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="form-field">
                <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
                  License Type
                </label>
                <select
                  id="license"
                  value={formData.license}
                  onChange={(e) => updateFormData('license', e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="cc0">Creative Commons Zero (Public Domain)</option>
                  <option value="cc-by">Creative Commons Attribution</option>
                  <option value="cc-by-sa">Creative Commons Attribution-ShareAlike</option>
                  <option value="proprietary">Proprietary</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Actions */}
        <div className="form-actions mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading || validationErrors.length > 0}
            className="primary-submit"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Contribution
              </>
            )}
          </Button>

          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isDraftSaving || isLoading}
            >
              {isDraftSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          )}
        </div>

        {/* Validation Summary */}
        {validationErrors.length > 0 && (
          <div className="validation-summary mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-yellow-800 font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Please fix the following issues:
            </h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </ContributionErrorBoundary>
  );
};

// Contribution listing component
export interface ContributionListProps {
  contributions: ContributionItem[];
  onView?: (contribution: ContributionItem) => void;
  onEdit?: (contribution: ContributionItem) => void;
  onDelete?: (contribution: ContributionItem) => void;
  onRate?: (contributionId: string, rating: number) => void;
  currentUserId?: string;
  isLoading?: boolean;
  error?: ContributionError;
  className?: string;
}

export const ContributionList: React.FC<ContributionListProps> = ({
  contributions,
  onView,
  onEdit,
  onDelete,
  onRate,
  currentUserId,
  isLoading = false,
  error,
  className = ''
}) => {
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  const handleAction = useCallback(async (
    contributionId: string,
    action: () => Promise<void> | void
  ) => {
    try {
      setLoadingActions(prev => new Set(prev).add(contributionId));
      await action();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(contributionId);
        return newSet;
      });
    }
  }, []);

  if (error) {
    return (
      <div className="error-state p-6 text-center">
        <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load contributions
        </h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-state p-6 text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading contributions...</p>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="empty-state p-6 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No contributions found
        </h3>
        <p className="text-gray-600">Be the first to contribute to the community!</p>
      </div>
    );
  }

  return (
    <ContributionErrorBoundary>
      <div className={`contribution-list ${className}`}>
        <div className="contributions-grid space-y-4">
          {contributions.map(contribution => (
            <Card key={contribution.id} className="contribution-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="contribution-header flex justify-between items-start mb-4">
                  <div className="contribution-info flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {contribution.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {contribution.description}
                    </p>
                    
                    <div className="contribution-meta flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="author-info flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{contribution.author.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {contribution.author.reputation} rep
                        </Badge>
                      </div>
                      
                      <div className="category">
                        <Badge variant="secondary">{contribution.category}</Badge>
                      </div>
                      
                      <div className="difficulty">
                        <Badge 
                          variant={contribution.difficulty === 'beginner' ? 'default' : 'outline'}
                        >
                          {contribution.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="date">
                        <Clock className="h-4 w-4 mr-1" />
                        {contribution.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="contribution-status">
                    <Badge 
                      variant={contribution.status === 'published' ? 'default' : 'outline'}
                      className={
                        contribution.status === 'published' ? 'bg-green-100 text-green-800' :
                          contribution.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            contribution.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {contribution.status}
                    </Badge>
                  </div>
                </div>

                <div className="contribution-stats flex items-center gap-6 mb-4">
                  <div className="stat-item flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span>{contribution.rating.toFixed(1)}</span>
                    <span className="ml-1">({contribution.reviewCount} reviews)</span>
                  </div>
                  
                  <div className="stat-item flex items-center text-sm text-gray-600">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{contribution.downloadCount} downloads</span>
                  </div>
                  
                  <div className="stat-item flex items-center text-sm text-gray-600">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{contribution.comments} comments</span>
                  </div>
                </div>

                <div className="contribution-tags mb-4">
                  <div className="tags-container flex flex-wrap gap-2">
                    {contribution.tags.slice(0, 5).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {contribution.tags.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{contribution.tags.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="contribution-actions flex gap-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(contribution.id, () => onView(contribution))}
                      disabled={loadingActions.has(contribution.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                  
                  {onEdit && currentUserId === contribution.author.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(contribution.id, () => onEdit(contribution))}
                      disabled={loadingActions.has(contribution.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  
                  {onDelete && currentUserId === contribution.author.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(contribution.id, () => onDelete(contribution))}
                      disabled={loadingActions.has(contribution.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ContributionErrorBoundary>
  );
};

// Export all components and utilities
export default ContributionForm;