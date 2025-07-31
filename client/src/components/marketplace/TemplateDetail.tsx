// Epic 16 Marketplace - Template Detail Page Component
import React, { useState, useEffect, useCallback } from 'react';
import { StarRating } from './StarRating';
import { PriceDisplay } from './PriceDisplay';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { TemplateCard } from './TemplateCard';
import { ReviewList } from './ReviewList';
import { PreviewModal } from './PreviewModal';
import { PurchaseModal } from './PurchaseModal';
import { useMarketplace } from '../../hooks/useMarketplace';
import './TemplateDetail.css';
}
interface TemplateDetailProps {
  templateId: string;
  className?: string;
  export const TemplateDetail: React.FC<TemplateDetailProps> = ({,)
  templateId,
  className = ''
}
}) => {
  const [template, setTemplate] = useState<unknown>(null);
  const [similarTemplates, setSimilarTemplates] = useState<Array<{
  id: string;,
  name: string;
  description: string;,
  rating: number;
  price: number;
}>>([]);
  const [reviews, setReviews] = useState<Array<{
  id: string;,
  rating: number;
  comment: string;,
  author: string;
  date: string;
}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'versions'>('overview');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { getTemplate, _previewTemplate, _purchaseTemplate } = useMarketplace();
  useEffect(() => {
    loadTemplateData();
  }, [loadTemplateData]);
  const loadTemplateData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load template details
      const templateData = await getTemplate(templateId);
      setTemplate(templateData);
      // Load similar templates
      const similarResponse = await fetch(`/api/marketplace/templates/${templateId}/similar?limit=4`);}
      if (similarResponse.ok) {
        const similarData = await similarResponse.json();
        setSimilarTemplates(similarData.templates || []);
      // Load reviews
      const reviewsResponse = await fetch(`/api/marketplace/templates/${templateId}/reviews`);}
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData || []);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load template');
} finally {
      setLoading(false);
  }, [templateId, getTemplate]);
  const handlePreview = () => {
    setShowPreview(true);
  };
  const handlePurchase = () => {
    setShowPurchase(true);
  };
  const handlePurchaseComplete = (success: boolean) => {
    setShowPurchase(false);
    if (success) {
      // Refresh template data to update purchase status
      loadTemplateData();
  };
  const handleSimilarTemplateClick = (id: string) => {
    // Navigate to similar template
    window.location.href = `/marketplace/templates/${id}`;}
  };
  if (loading) {
    return;
      <div className={`template-detail loading ${className}`}>}
        <LoadingSpinner size="large" message="Loading template..." />
      </div>
    );
  if (error || !template) {
    return;
      <div className={`template-detail error ${className}`}>}
        <div className="error-message">
          <h2>Template not found</h2>
          <p>{error || 'The requested template could not be found.'}</p>
          <button onClick={() => window.history.back()} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  return;
    <div className={`template-detail ${className}`}>}
      {/* Header */}
      <header className="template-header">
        <div className="header-content">
          <div className="header-main">
            <div className="template-badges">
              {template.featured_at && <Badge variant="featured">Featured</Badge>}
              {template.price_cents === 0 && <Badge variant="free">Free</Badge>}
              {template.is_ai_generated && <Badge variant="ai">AI Generated</Badge>}
            </div>
            <h1 className="template-title">{template.title}</h1>
            {template.description && ()
              <p className="template-description">{template.description}</p>
            )}
            <div className="template-meta">
              <div className="rating-section">
                <StarRating rating={template.avg_rating} />
                <span className="rating-text">
                  {template.avg_rating.toFixed(1)} ({template.total_reviews} reviews)
                </span>
              </div>
              <div className="stats-section">
                <span className="stat">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 4.5C2 3.11929 3.11929 2 4.5 2H11.5C12.8807 2 14 3.11929 14 4.5V9.5C14 10.8807 12.8807 12 11.5 12H8.5L5 14V12H4.5C3.11929 12 2 10.8807 2 9.5V4.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {template.total_purchases} purchases
                </span>
                <span className="stat">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {template.total_views} views
                </span>
              </div>
            </div>
            {/* Tags */}
            {template.tags.length > 0 && ()
              <div className="template-tags">
                {template.tags.map((tag: string) => ()
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
          {/* Purchase Section */}
          <div className="purchase-section">
            <div className="price-container">
              <PriceDisplay priceCents={template.price_cents} size="large" />
            </div>
            <div className="action-buttons">
              <button 
                onClick={handlePreview}
                className="preview-button"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M1 10C1 10 4.5 3 10 3C15.5 3 19 10 19 10C19 10 15.5 17 10 17C4.5 17 1 10 1 10Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Preview
              </button>
              <button 
                onClick={handlePurchase}
                className="purchase-button"
              >
                {template.price_cents === 0 ? 'Get Free' : 'Purchase'}
              </button>
            </div>
            {/* Creator Info */}
            {template.owner && ()
              <div className="creator-info">
                <h4>Created by</h4>
                <div className="creator-details">
                  <span className="creator-name">{template.owner.name}</span>
                  {template.owner.verified && ()
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      className="verified-icon"
                      title="Verified creator"
                    >
                      <path
                        d="M6 8L7 9L10 6M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
                        stroke="#10B981"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  )}
                </div>
              </div>
            )}
            {/* Claude Compatibility */}
            <div className="compatibility-info">
              <h4>Compatible with</h4>
              <div className="compat-models">
                {template.claude_compat.map((model: string) => ()
                  <span key={model} className="compat-model">
                    {model.replace('claude-', 'Claude ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Content Tabs */}
      <div className="content-section">
        <nav className="content-tabs">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            Reviews ({template.total_reviews})
          </button>
          <button 
            onClick={() => setActiveTab('versions')}
            className={`tab ${activeTab === 'versions' ? 'active' : ''}`}
          >
            Versions
          </button>
        </nav>
        <div className="tab-content">
          {activeTab === 'overview' && ()
            <div className="overview-content">
              <div className="main-content">
                <section className="description-section">
                  <h3>About this template</h3>
                  <p>{template.description || 'No description available.'}</p>
                </section>
                {template.categories && template.categories.length > 0 && ()
                  <section className="categories-section">
                    <h3>Categories</h3>
                    <div className="categories">
                      {template.categories.map((category: string) => ()
                        <span key={category} className="category">{category}</span>
                      ))}
                    </div>
                  </section>
                )}
                <section className="usage-section">
                  <h3>Usage Instructions</h3>
                  <div className="usage-steps">
                    <div className="step">
                      <span className="step-number">1</span>
                      <div className="step-content">
                        <h4>Preview the template</h4>
                        <p>Click the preview button to see how the template works with sample inputs.</p>
                      </div>
                    </div>
                    <div className="step">
                      <span className="step-number">2</span>
                      <div className="step-content">
                        <h4>Purchase or get for free</h4>
                        <p>Add the template to your collection to start using it in your projects.</p>
                      </div>
                    </div>
                    <div className="step">
                      <span className="step-number">3</span>
                      <div className="step-content">
                        <h4>Import and customize</h4>
                        <p>Import the template into your workspace and customize it for your needs.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <aside className="sidebar-content">
                <section className="stats-section">
                  <h3>Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{template.total_purchases}</span>
                      <span className="stat-label">Purchases</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{template.total_views}</span>
                      <span className="stat-label">Views</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{template.avg_rating.toFixed(1)}</span>
                      <span className="stat-label">Rating</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{template.total_reviews}</span>
                      <span className="stat-label">Reviews</span>
                    </div>
                  </div>
                </section>
                <section className="technical-specs">
                  <h3>Technical Details</h3>
                  <div className="specs-list">
                    <div className="spec-item">
                      <span className="spec-label">Created:</span>
                      <span className="spec-value">
                        {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">AI Generated:</span>
                      <span className="spec-value">
                        {template.is_ai_generated ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Version:</span>
                      <span className="spec-value">Latest</span>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          )}
          {activeTab === 'reviews' && ()
            <div className="reviews-content">
              <ReviewList 
                reviews={reviews}
                templateId={templateId}
                onReviewAdded={loadTemplateData}
              />
            </div>
          )}
          {activeTab === 'versions' && ()
            <div className="versions-content">
              <p>Version history will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
      {/* Similar Templates */}
      {similarTemplates.length > 0 && ()
        <section className="similar-templates">
          <h2>Similar Templates</h2>
          <div className="similar-grid">
            {similarTemplates.map((similarTemplate) => ()
              <TemplateCard
                key={similarTemplate.id}
                template={similarTemplate}
                onClick={() => handleSimilarTemplateClick(similarTemplate.id)}
                variant="grid"
              />
            ))}
          </div>
        </section>
      )}
      {/* Modals */}
      {showPreview && ()
        <PreviewModal
          templateId={templateId}
          template={template}
          onClose={() => setShowPreview(false)}
        />
      )}
      {showPurchase && ()
        <PurchaseModal
          template={template}
          onClose={() => setShowPurchase(false)}
          onComplete={handlePurchaseComplete}
        />
      )}
    </div>
  );
};