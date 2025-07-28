// Epic 16 Marketplace - Template Card Component
import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { PriceDisplay } from './PriceDisplay';
import { Badge } from '../common/Badge';
import { PreviewModal } from './PreviewModal';
import './TemplateCard.css';
interface Template {
  id: string;,
  title: string;
  description?: string;
  tags: string;,
  price_cents: number;
  avg_rating: number;,
  total_reviews: number;
  total_purchases: number;
  categories?: string;
  owner?: {,
  id: string;,
  name: string;
  verified: boolean;
};
  featured_at?: string;
  created_at: string;
  is_ai_generated?: boolean;
  claude_compat: string;
interface TemplateCardProps {
  template: Template;,
  onClick: () => void;
  variant?: 'grid' | 'list' | 'featured';
  showStats?: boolean;
  className?: string;
  export const TemplateCard: React.FC<TemplateCardProps> = ({,)
  template,
  onClick,
  variant = 'grid',
  showStats = true,
  className = ''
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const {
    title,
    description,
    tags,
    price_cents,
    avg_rating,
    total_reviews,
    total_purchases,
    categories,
    owner,
    featured_at,
    is_ai_generated,
    claude_compat
  } = template;
  const truncatedDescription = description && description.length > 120 ;
    ? description.substring(0, 120) + '...' 
    : description;
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };
  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
  };
  const handleOwnerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to creator profile
    if (owner?.id) {
      window.location.href = `/creators/${owner.id}`;}
  };
  return;
    <div 
      className={`template-card ${variant} ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
      }}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="template-badges">
          {featured_at && <Badge variant="featured">Featured</Badge>}
          {price_cents === 0 && <Badge variant="free">Free</Badge>}
          {is_ai_generated && <Badge variant="ai">AI Generated</Badge>}
        </div>
        <button
          onClick={handlePreviewClick}
          className="preview-button"
          aria-label="Preview template"
          title="Preview template"
        >
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
        </button>
      </div>
      {/* Card Content */}
      <div className="card-content">
        <h3 className="template-title">{title}</h3>
        {truncatedDescription && ()
          <p className="template-description">{truncatedDescription}</p>
        )}
        {/* Template Tags */}
        {tags.length > 0 && ()
          <div className="template-tags">
            {tags.slice(0, 3).map((tag) => ()
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
            {tags.length > 3 && ()
              <span className="tag more">+{tags.length - 3}</span>
            )}
          </div>
        )}
        {/* Categories */}
        {categories && categories.length > 0 && ()
          <div className="template-categories">
            {categories.slice(0, 2).map((category) => ()
              <span key={category} className="category">
                {category}
              </span>
            ))}
          </div>
        )}
        {/* Claude Compatibility */}
        <div className="claude-compat">
          <span className="compat-label">Compatible with:</span>
          <div className="compat-models">
            {claude_compat.slice(0, 2).map((model) => ()
              <span key={model} className="compat-model">
                {model.replace('claude-', '')}
              </span>
            ))}
            {claude_compat.length > 2 && ()
              <span className="compat-model more">+{claude_compat.length - 2}</span>
            )}
          </div>
        </div>
      </div>
      {/* Card Footer */}
      <div className="card-footer">
        <div className="footer-top">
          {/* Rating */}
          <div className="rating-section">
            <StarRating rating={avg_rating} />
            <span className="rating-text">
              {avg_rating.toFixed(1)} ({total_reviews})
            </span>
          </div>
          {/* Price */}
          <PriceDisplay 
            priceCents={price_cents} 
            size="medium"
          />
        </div>
        <div className="footer-bottom">
          {/* Creator Info */}
          {owner && ()
            <button
              onClick={handleOwnerClick}
              className="creator-info"
              aria-label={`View ${owner.name}'s profile`}
            >
              <span className="creator-name">{owner.name}</span>
              {owner.verified && ()
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 14 14" 
                  fill="none"
                  className="verified-icon"
                  title="Verified creator"
                >
                  <path
                    d="M5.25 7L6.25 8L8.75 5.5M12.25 7C12.25 9.89949 9.89949 12.25 7 12.25C4.10051 12.25 1.75 9.89949 1.75 7C1.75 4.10051 4.10051 1.75 7 1.75C9.89949 1.75 12.25 4.10051 12.25 7Z"
                    stroke="#10B981"
                    strokeWidth="1.16667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          )}
          {/* Stats */}
          {showStats && ()
            <div className="template-stats">
              <span className="stat">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.5L6 8.885L2.91 10.5L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                    fill="currentColor"
                  />
                </svg>
                {total_purchases}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Preview Modal */}
      {showPreview && ()
        <PreviewModal
          templateId={template.id}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};