/**
 * Epic 16 Marketplace Card Component
 * 
 * Reusable card component for displaying marketplace templates with
 * consistent design patterns for thumbnail, metadata, pricing, and actions.
 */

import React, { useState } from 'react';

export interface MarketplaceTemplate {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number; // in cents
  currency: string;
  tags: string[];
  rating: number; // 0-5 scale
  reviewCount: number;
  creatorName: string;
  creatorAvatar?: string;
  compatibility: string[]; // Claude models
  isAiGenerated: boolean;
  status: 'draft' | 'listed' | 'blocked' | 'archived';
  stats: {
    downloads: number;
    views: number;
    likes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface MarketplaceCardProps {
  template: MarketplaceTemplate;
  variant?: 'grid' | 'list' | 'featured';
  showActions?: boolean;
  onPreview?: (template: MarketplaceTemplate) => void;
  onPurchase?: (template: MarketplaceTemplate) => void;
  onLike?: (template: MarketplaceTemplate) => void;
  onShare?: (template: MarketplaceTemplate) => void;
  className?: string;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  template,
  variant = 'grid',
  showActions = true,
  onPreview,
  onPurchase,
  onLike,
  onShare,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const formatPrice = (cents: number, currency: string) => {
    if (cents === 0) return 'Free';
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(template);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${template.id}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${template.id})`} d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="h-4 w-4 text-gray-300" viewBox="0 0 20 20">
            <path fill="currentColor" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        );
      }
    }
    return stars;
  };

  if (variant === 'list') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
        <div className="p-4">
          <div className="flex space-x-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                {template.thumbnailUrl && !imageError ? (
                  <img
                    src={template.thumbnailUrl}
                    alt={template.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{template.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      {renderStars(template.rating)}
                      <span className="ml-1 text-sm text-gray-600">
                        {formatRating(template.rating)} ({template.reviewCount})
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      by {template.creatorName}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(template.price, template.currency)}
                  </div>
                  
                  {showActions && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onPreview?.(template)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => onPurchase?.(template)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {template.price === 0 ? 'Get Free' : 'Buy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid and Featured variants
  const isFeature = variant === 'featured';
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${isFeature ? 'col-span-2' : ''} ${className}`}>
      {/* Thumbnail */}
      <div className={`relative ${isFeature ? 'h-48' : 'h-32'} bg-gray-100 rounded-t-lg overflow-hidden`}>
        {template.thumbnailUrl && !imageError ? (
          <img
            src={template.thumbnailUrl}
            alt={template.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex space-x-1">
          {template.price === 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
              Free
            </span>
          )}
          {template.isAiGenerated && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
              AI Generated
            </span>
          )}
        </div>

        {/* Actions overlay */}
        {showActions && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={handleLike}
              className={`p-1.5 rounded-full transition-colors ${
                isLiked 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            
            <button
              onClick={() => onShare?.(template)}
              className="p-1.5 bg-white/80 text-gray-600 rounded-full hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-medium text-gray-900 ${isFeature ? 'text-lg' : 'text-sm'} line-clamp-2`}>
            {template.title}
          </h3>
          <div className={`flex-shrink-0 ml-2 font-bold text-gray-900 ${isFeature ? 'text-lg' : 'text-sm'}`}>
            {formatPrice(template.price, template.currency)}
          </div>
        </div>

        <p className={`text-gray-500 mb-3 ${isFeature ? 'text-sm' : 'text-xs'} line-clamp-2`}>
          {template.description}
        </p>

        {/* Rating and reviews */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {renderStars(template.rating)}
            <span className={`ml-1 text-gray-600 ${isFeature ? 'text-sm' : 'text-xs'}`}>
              {formatRating(template.rating)} ({template.reviewCount})
            </span>
          </div>
          
          <div className={`text-gray-500 ${isFeature ? 'text-sm' : 'text-xs'}`}>
            {template.stats.downloads} downloads
          </div>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, isFeature ? 6 : 3).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 bg-gray-100 text-gray-600 rounded-full ${isFeature ? 'text-xs' : 'text-xs'}`}
              >
                {tag}
              </span>
            ))}
            {template.tags.length > (isFeature ? 6 : 3) && (
              <span className={`px-2 py-1 bg-gray-100 text-gray-600 rounded-full ${isFeature ? 'text-xs' : 'text-xs'}`}>
                +{template.tags.length - (isFeature ? 6 : 3)}
              </span>
            )}
          </div>
        )}

        {/* Creator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {template.creatorAvatar ? (
              <img
                src={template.creatorAvatar}
                alt={template.creatorName}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  {template.creatorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className={`ml-2 text-gray-600 ${isFeature ? 'text-sm' : 'text-xs'}`}>
              {template.creatorName}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => onPreview?.(template)}
              className={`flex-1 py-2 px-3 text-center border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors ${isFeature ? 'text-sm' : 'text-xs'}`}
            >
              Preview
            </button>
            <button
              onClick={() => onPurchase?.(template)}
              className={`flex-1 py-2 px-3 text-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${isFeature ? 'text-sm' : 'text-xs'}`}
            >
              {template.price === 0 ? 'Get Free' : 'Buy Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceCard;