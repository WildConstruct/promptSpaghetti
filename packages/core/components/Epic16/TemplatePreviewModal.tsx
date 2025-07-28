/**
 * Epic 16 Template Preview Modal Component
 * 
 * Modal component for previewing marketplace templates with Claude integration,
 * sandboxed content protection, and purchase flow integration.
 */
import React, { useState, useEffect, useRef } from 'react';
import { MarketplaceTemplate } from './MarketplaceCard';
interface PreviewResult {
  output: string;
  cost: number;
  qualityScore: number;
  tokens: number;
  model: string;
  executionTime: number;
}
interface TemplatePreviewModalProps {
  template: MarketplaceTemplate;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (template: MarketplaceTemplate) => void;
  onPreviewGenerate?: (template: MarketplaceTemplate, input: string, model?: string) => Promise<PreviewResult>;
  isPurchased?: boolean;
  currentUser?: {
    id: string;
    name: string;
    tier: 'free' | 'pro' | 'enterprise';
  };
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({)
  template,
  isOpen,
  onClose,
  onPurchase,
  onPreviewGenerate,
  isPurchased = false,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'details' | 'reviews'>('preview');
  const [previewInput, setPreviewInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-haiku');
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const streamRef = useRef<HTMLDivElement>(null);
  // Rate limiting based on user tier
  const getRateLimit = () => {
    if (!currentUser) return 3;
    switch (currentUser.tier) {
    case 'enterprise': return 50;
    case 'pro': return 25;
    case 'free': default: return 3;
    }
  };
  const canGenerate = usageCount < getRateLimit();
  useEffect(() => {
    if (isOpen) {
      setActiveTab('preview');
      setPreviewInput('');
      setPreviewResult(null);
      setPreviewError(null);
      setUsageCount(0);
    }
  }, [isOpen]);
  const handlePreviewGenerate = async () => {
    if (!onPreviewGenerate || !canGenerate || !previewInput.trim()) return;
    setIsGenerating(true);
    setPreviewError(null);
    setPreviewResult(null);
    try {
      const result = await onPreviewGenerate(template, previewInput, selectedModel);
      setPreviewResult(result);
      setUsageCount(prev => prev + 1);
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'Preview generation failed');
    } finally {
      setIsGenerating(false);
    }
  };
  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {)
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(cost);
  };
  const formatPrice = (cents: number, currency: string) => {
    if (cents === 0) return 'Free';
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {)
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };
  if (!isOpen) return null;
  return ()
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{template.title}</h2>
                <p className="text-sm text-gray-500">by {template.creatorName}</p>
              </div>
              {/* Price and badges */}
              <div className="flex items-center space-x-3">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(template.price, template.currency)}
                </div>
                {template.isAiGenerated && ()
                  <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                    AI Generated
                  </span>
                )}
                {isPurchased && ()
                  <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                    Owned
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Tabs */}
          <nav className="flex space-x-8 mt-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Live Preview
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Template Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({template.reviewCount})
            </button>
          </nav>
        </div>
        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'preview' && ()
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Try it out with your input:
                    </label>
                    <textarea
                      value={previewInput}
                      onChange={(e) => setPreviewInput(e.target.value)}
                      placeholder={isPurchased 
                        ? 'Enter your prompt input to see the full template in action...' 
                        : 'Enter your prompt input to see a preview (some content will be masked until purchase)...'
                      }
                      className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Claude Model:
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {template.compatibility.map((model) => ()
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-shrink-0 pt-6">
                      <button
                        onClick={handlePreviewGenerate}
                        disabled={!canGenerate || !previewInput.trim() || isGenerating}
                        className={`px-4 py-2 rounded-md font-medium ${
                          canGenerate && previewInput.trim() && !isGenerating
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isGenerating ? 'Generating...' : 'Generate Preview'}
                      </button>
                    </div>
                  </div>
                  {/* Rate limit warning */}
                  <div className="text-sm text-gray-600">
                    Preview generations remaining: <span className="font-medium">{getRateLimit() - usageCount}</span>
                    {currentUser?.tier === 'free' && ()
                      <span className="text-blue-600"> (Upgrade for more previews)</span>
                    )}
                  </div>
                </div>
                {/* Output Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview Output:
                    </label>
                    {previewError ? ()
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex">
                          <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Preview Error</h3>
                            <p className="text-sm text-red-700 mt-1">{previewError}</p>
                          </div>
                        </div>
                      </div>
                    ) : previewResult ? ()
                      <div className="space-y-3">
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                          <div 
                            ref={streamRef}
                            className="whitespace-pre-wrap text-sm text-gray-900 font-mono max-h-64 overflow-y-auto"
                          >
                            {previewResult.output}
                          </div>
                        </div>
                        {/* Preview metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 border border-gray-200 rounded">
                            <div className="text-gray-500">Cost</div>
                            <div className="font-medium">{formatCost(previewResult.cost)}</div>
                          </div>
                          <div className="bg-white p-3 border border-gray-200 rounded">
                            <div className="text-gray-500">Quality Score</div>
                            <div className="font-medium">{previewResult.qualityScore.toFixed(1)}/5</div>
                          </div>
                          <div className="bg-white p-3 border border-gray-200 rounded">
                            <div className="text-gray-500">Tokens</div>
                            <div className="font-medium">{previewResult.tokens.toLocaleString()}</div>
                          </div>
                          <div className="bg-white p-3 border border-gray-200 rounded">
                            <div className="text-gray-500">Execution Time</div>
                            <div className="font-medium">{previewResult.executionTime}ms</div>
                          </div>
                        </div>
                        {!isPurchased && ()
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex">
                              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  This is a sandboxed preview with masked content. Purchase the template to access the full prompt and all features.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : ()
                      <div className="h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                        <div className="text-center">
                          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">
                            Enter input above and click Generate to see a preview
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'details' && ()
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{template.description}</p>
              </div>
              {/* Tags */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => ()
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {/* Compatibility */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Compatible Models</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {template.compatibility.map((model) => ()
                    <div key={model} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="font-medium text-sm">{model}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Stats */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Statistics</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{template.stats.downloads.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{template.stats.views.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{template.stats.likes.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Likes</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'reviews' && ()
            <div className="p-6">
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4L1 20l4-4 4-4a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Reviews Coming Soon</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Review and rating system will be available in a future update.
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {template.updatedAt.toLocaleDateString()}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {!isPurchased && ()
                <button
                  onClick={() => onPurchase(template)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  {template.price === 0 ? 'Get Free Template' : `Buy for ${formatPrice(template.price, template.currency)}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;