/**
 * Epic 16 Help Request Form
 * 
 * Intelligent help request submission form with auto-suggestions,
 * knowledge base integration, and smart categorization.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HelpRequest,
  HelpRequestType,
  HelpCategory,
  HelpPriority,
  Epic16HelpRequestService,
  KnowledgeBaseArticle }
  RequestContext
 from '../../services/Epic16HelpRequestService';


interface HelpRequestFormProps { helpService: Epic16HelpRequestService;
  userId: string;
  userType: 'guest' | 'user' | 'seller' | 'buyer' | 'admin';
  userTier: 'free' | 'premium' | 'enterprise';
  context?: Partial<RequestContext>;
  onSubmitted?: (request: HelpRequest) => void;
  onCancel?: () => void;
  interface FormData {
  type: HelpRequestType;
  category: HelpCategory;
  subcategory: string;
  priority: HelpPriority;
  title: string;
  description: string;
  tags: string;
  attachments: File;
  const categorySubcategories: Record<HelpCategory, string> = {;
  [HelpCategory.GETTING_STARTED]: ['account_setup', 'first_purchase', 'navigation', 'basic_features'];
  [HelpCategory.TEMPLATES]: ['submission', 'approval', 'licensing', 'customization', 'downloads'];
  [HelpCategory.MARKETPLACE]: ['selling', 'buying', 'payments', 'disputes', 'reviews'];
  [HelpCategory.BILLING]: ['payments', 'refunds', 'subscriptions', 'invoices', 'taxes'];
  [HelpCategory.ACCOUNT]: ['profile', 'security', 'preferences', 'deletion'];
  [HelpCategory.TECHNICAL]: ['bugs', 'performance', 'compatibility', 'api'];
  [HelpCategory.COMMUNITY]: ['forums', 'moderation', 'guidelines', 'events'];
  [HelpCategory.PARTNERSHIPS]: ['affiliate', 'integration', 'business_development'];
  [HelpCategory.COMPLIANCE]: ['dmca', 'privacy', 'terms_of_service', 'licensing'];
  [HelpCategory.GENERAL]: ['feedback', 'feature_request', 'other'] }


};

export const HelpRequestForm: React.FC<HelpRequestFormProps> = ({ )
  helpService
  userId
  userType
  userTier
  context
  onSubmitted }
  onCancel
}) => { // Form state
  const [formData, setFormData] = useState<FormData>({)
  type: HelpRequestType.QUESTION
  category: HelpCategory.GENERAL
  subcategory: 'other'
  priority: HelpPriority.MEDIUM
  title: ''
  description: ''
  tags: []
  attachments: [] }
});
  // UI state
  const [step, setStep] = useState<'category' | 'details' | 'suggestions' | 'review'>('category');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedArticles, setSuggestedArticles] = useState<KnowledgeBaseArticle>([]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [showArticlePreview, setShowArticlePreview] = useState(false);
  // Auto-suggestions and validation
  const [titleSuggestions, setTitleSuggestions] = useState<string>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  // Get available subcategories for selected category
  const availableSubcategories = useMemo(() => { return categorySubcategories[formData.category] || [] }, [formData.category]);
  // Auto-update subcategory when category changes
  useEffect(() => {
    if (availableSubcategories.length > 0 && !availableSubcategories.includes(formData.subcategory)) {
      setFormData(prev => ({ ...prev, subcategory: availableSubcategories[0] }));
  }, [formData.category, availableSubcategories, formData.subcategory]);
  // Search for suggestions when title/description changes
  const searchSuggestions = useCallback(async (query: string) => { if (query.length < 3) {
  setSuggestedArticles([]);
  return;
  try {
  const articles = await helpService.searchKnowledgeBase({)
  query,
  categories: [formData.category],
  limit: 5 }
});
      setSuggestedArticles(articles);
 catch (err) { console.error('Failed to search suggestions:', err) }, [helpService, formData.category]);
  useEffect(() => {
    const searchQuery = `${formData.title} ${formData.description}`.trim();}
    if (searchQuery.length >= 3) { const timer = setTimeout(() => searchSuggestions(searchQuery), 500);
      return () => clearTimeout(timer) }, [formData.title, formData.description, searchSuggestions]);
  // Generate title suggestions based on category and type
  const generateTitleSuggestions = useCallback(() => { const suggestions: Record<string, string> = {
  [HelpRequestType.QUESTION]: [
  'How do I...?'
  'What is the best way to...?'
  'Can you help me understand...?'
  'I need help with...'
  ]
  [HelpRequestType.TECHNICAL_ISSUE]: [
  'Unable to...'
  'Error when trying to...'
  'Feature not working...'
  'Performance issue with...'
  ]
  [HelpRequestType.BUG_REPORT]: [
  'Bug: Unable to...'
  'Bug: Error in...'
  'Bug: Unexpected behavior when...'
  'Bug: Feature not functioning...']
  [HelpRequestType.FEATURE_REQUEST]: [
  'Feature Request: Add ability to...'
  'Enhancement: Improve...'
  'Suggestion: New feature for...' }
  'Request: Better...'];
};
    setTitleSuggestions(suggestions[formData.type] || []);
  }, [formData.type]);
  useEffect(() => { generateTitleSuggestions() }, [generateTitleSuggestions]);
  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) { errors.title = 'Title is required' } else if (formData.title.length < 5) { errors.title = 'Title must be at least 5 characters';
    if (!formData.description.trim()) {
      errors.description = 'Description is required' } else if (formData.description.length < 20) { errors.description = 'Description must be at least 20 characters';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0 };
  // Handle form submission
  const handleSubmit = async () => { if (!validateForm()) {
  setError('Please fix the validation errors before submitting.');
  return;
  setLoading(true);
  setError(null);
  try {
  const requestContext: RequestContext = {,
  userAgent: navigator.userAgent,
  ipAddress: '0.0.0.0', // Would be filled by backend,
  location: {,
  country: 'US', // Would be detected,
  region: 'CA',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
},
  sessionId: `session_${Date.now()}`}
},
  pageUrl: window.location.href,
        referrer: document.referrer,
        userJourney: [], // Would be tracked
        feature: context?.feature || 'help_form',
        section: context?.section || 'help_center',
        templateId: context?.templateId,
        marketplaceListingId: context?.marketplaceListingId,
        browserInfo: { ,
  name: 'Chrome', // Would be detected,
  version: '120.0',
  platform: navigator.platform }
},
  screenResolution: `${screen.width}x${screen.height}`}
},
  errorLogs: context?.errorLogs,
        subscriptionPlan: userTier,
        accountAge: 30, // Would be calculated
        previousTickets: 0, // Would be queried
        successfulTransactions: 0, // Would be queried
        ...context
      };
      const helpRequest = await helpService.submitHelpRequest({ )
  type: formData.type,
  category: formData.category,
  subcategory: formData.subcategory,
  priority: formData.priority,
  title: formData.title,
  description: formData.description,
  context: requestContext,
  userId,
  userType,
  userTier,
  routingDecision: {,
  strategy: 'support_agent',
  confidence: 0.5,
  reasoning: 'Initial submission',
  estimatedResolutionTime: 240 }
},
  escalationLevel: 0,
        suggestedArticles: [],
        responses: [],
        tags: formData.tags,
        attachments: [], // Would handle file uploads
        relatedRequests: [];
  });
      onSubmitted?.(helpRequest);
 catch (err) { setError(err instanceof Error ? err.message : 'Failed to submit help request') } finally { setLoading(false) };
  // Handle article selection
  const handleArticleSelect = (article: KnowledgeBaseArticle) => { setSelectedArticle(article);
    setShowArticlePreview(true) };
  // Handle file upload
  const handleFileUpload = (files: FileList | null) => { if (!files) return;
    const newFiles = Array.from(files).filter(file => {)
  // Validate file type and size
      const allowedTypes = ['image/', 'text/', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB;
      return allowedTypes.some(type => file.type.startsWith(type)) && file.size <= maxSize });
    setFormData(prev => ({ )
  ...prev,
  attachments: [...prev.attachments, ...newFiles] }
}));
  };
  // Remove attachment
  const removeAttachment = (index: number) => { setFormData(prev => ({)
  ...prev,
  attachments: prev.attachments.filter((_, i) => i !== index) }
}));
  };
  // Add tag
  const addTag = (tag: string) => { if (tag && !formData.tags.includes(tag)) {
  setFormData(prev => ({)
  ...prev,
  tags: [...prev.tags, tag] }
}));
  };
  // Remove tag
  const removeTag = (tag: string) => { setFormData(prev => ({)
  ...prev,
  tags: prev.tags.filter(t => t !== tag) }
}));
  };
  // Render category selection step
  const renderCategoryStep = () => (;);
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">What do you need help with?</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.values(HelpRequestType).map((type) => ()
            <label
              key={type}
              className={ `relative flex cursor-pointer rounded-lg border p-4 ${
  formData.type === type
  ? 'border-blue-500 bg-blue-50'
  : 'border-gray-300 bg-white hover:bg-gray-50' }
`}
            >
              <input
                type="radio"
                value={type}
                checked={formData.type === type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as HelpRequestType })}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {type === HelpRequestType.QUESTION && 'General questions about features or processes'}
                  {type === HelpRequestType.TECHNICAL_ISSUE && 'Problems with functionality or performance'}
                  {type === HelpRequestType.BUG_REPORT && 'Report bugs or unexpected behavior'}
                  {type === HelpRequestType.FEATURE_REQUEST && 'Suggest new features or improvements'}
                  {type === HelpRequestType.ACCOUNT_ISSUE && 'Account-related problems or questions'}
                  {type === HelpRequestType.BILLING_INQUIRY && 'Billing, payments, or subscription questions'}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as HelpCategory })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.values(HelpCategory).map((category) => ()
            <option key={category} value={category}>
              {category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
        <select
          value={formData.subcategory}
          onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {availableSubcategories.map((subcategory) => ()
            <option key={subcategory} value={subcategory}>
              {subcategory.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as HelpPriority })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.values(HelpPriority).map((priority) => ()
            <option key={priority} value={priority}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
  // Render details step
  const renderDetailsStep = () => (;);
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief description of your issue or question"
          className={ `w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
  validationErrors.title ? 'border-red-300' : 'border-gray-300' }
`}
        />
        {validationErrors.title && ()
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
        {titleSuggestions.length > 0 && ()
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Suggested formats:</p>
            <div className="flex flex-wrap gap-1">
              {titleSuggestions.map((suggestion, index) => ()
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, title: suggestion })}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
          rows={6}
          className={ `w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
  validationErrors.description ? 'border-red-300' : 'border-gray-300' }
`}
        />
        {validationErrors.description && ()
          <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.description.length} characters (minimum 20 required)
        </p>
      </div>
      {/* File attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
          <input
            type="file"
            multiple
            accept="image/*,text/*,.pdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="mt-2 text-sm text-gray-600">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-500">
              Images, text files, PDFs (max 10MB each)
            </span>
          </label>
        </div>
        {formData.attachments.length > 0 && ()
          <div className="mt-3 space-y-2">
            {formData.attachments.map((file, index) => ()
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => ()
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add tags to help categorize your request"
          onKeyPress={ (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(e.currentTarget.value.trim());
              e.currentTarget.value = '' }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Press Enter to add tags</p>
      </div>
    </div>
  );
  // Render suggestions step
  const renderSuggestionsStep = () => (;);
    <div className="space-y-6">
      {suggestedArticles.length > 0 ? ()
        <>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              We found some articles that might help
            </h3>
            <p className="text-sm text-gray-600">
              Please review these before submitting your request. They might resolve your issue immediately.
            </p>
          </div>
          <div className="space-y-3">
            {suggestedArticles.map((article) => ()
              <div
                key={article.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleArticleSelect(article)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{article.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Relevance: {(article.relevanceScore * 100).toFixed(0)}%</span>
                      <span>Rating: {article.helpfulnessRating}/5</span>
                      <span>{article.viewCount} views</span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  If none of these articles solve your issue, you can continue with submitting your help request.
                  Our support team will be notified and will respond as soon as possible.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : ()
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.322-1.1l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No matching articles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            We'll route your request to our support team for personalized assistance.
          </p>
        </div>
      )}
    </div>
  );
  // Render review step
  const renderReviewStep = () => (;);
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review your request</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <span className="ml-2 text-sm text-gray-900">
              {formData.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <span className="ml-2 text-sm text-gray-900">
              {formData.category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} › 
              {formData.subcategory.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Priority:</span>
            <span className="ml-2 text-sm text-gray-900 capitalize">{formData.priority}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Title:</span>
            <p className="text-sm text-gray-900 mt-1">{formData.title}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Description:</span>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{formData.description}</p>
          </div>
          {formData.tags.length > 0 && ()
            <div>
              <span className="text-sm font-medium text-gray-700">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.tags.map((tag) => ()
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {formData.attachments.length > 0 && ()
            <div>
              <span className="text-sm font-medium text-gray-700">Attachments:</span>
              <ul className="text-sm text-gray-900 mt-1">
                {formData.attachments.map((file, index) => ()
                  <li key={index}>• {file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Your request will be automatically categorized and routed</li>
                <li>You'll receive a confirmation email with your request ID</li>
                <li>Our team will respond within our SLA timeframes</li>
                <li>You can track progress in your help center dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return;
    <div className="help-request-form max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {['category', 'details', 'suggestions', 'review'].map((stepName, index) => ()
            <React.Fragment key={stepName}>
              <div className={ `flex items-center justify-center w-8 h-8 rounded-full border-2 ${
  step === stepName
  ? 'bg-blue-600 border-blue-600 text-white'
  : index < ['category', 'details', 'suggestions', 'review'].indexOf(step)
  ? 'bg-green-600 border-green-600 text-white'
  : 'border-gray-300 text-gray-500' }
`}>
                {index < ['category', 'details', 'suggestions', 'review'].indexOf(step) ? ()
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : ()
                  index + 1
                )}
              </div>
              { index < 3 && ()
                <div className={`flex-1 h-0.5 mx-2 ${
  index < ['category', 'details', 'suggestions', 'review'].indexOf(step) ? 'bg-green-600' : 'bg-gray-300' }
`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Category</span>
          <span>Details</span>
          <span>Suggestions</span>
          <span>Review</span>
        </div>
      </div>
      {/* Form content */}
      <div className="bg-white">
        {step === 'category' && renderCategoryStep()}
        {step === 'details' && renderDetailsStep()}
        {step === 'suggestions' && renderSuggestionsStep()}
        {step === 'review' && renderReviewStep()}
      </div>
      {/* Error message */}
      {error && ()
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          { step !== 'category' && ()
            <button
              type="button"
              onClick={() => {
                const steps = ['category', 'details', 'suggestions', 'review'];
                const currentIndex = steps.indexOf(step);
                if (currentIndex > 0) {
                  setStep(steps[currentIndex - 1] as any) }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {onCancel && ()
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          {step === 'review' ? ()
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          ) : ()
            <button
              type="button"
              onClick={ () => {
                if (step === 'details' && !validateForm()) {
                  return;
                const steps = ['category', 'details', 'suggestions', 'review'];
                const currentIndex = steps.indexOf(step);
                if (currentIndex < steps.length - 1) {
                  setStep(steps[currentIndex + 1] as any) }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {step === 'suggestions' && suggestedArticles.length === 0 ? 'Continue to Review' : 'Next'}
            </button>
          )}
        </div>
      </div>
      {/* Article preview modal */}
      {showArticlePreview && selectedArticle && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{selectedArticle.title}</h3>
                <button
                  onClick={() => setShowArticlePreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">{selectedArticle.summary}</p>
                <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Rating: {selectedArticle.helpfulnessRating}/5 • {selectedArticle.viewCount} views
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowArticlePreview(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.open(selectedArticle.url, '_blank')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Open Full Article
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpRequestForm;