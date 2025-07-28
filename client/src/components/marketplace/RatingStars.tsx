// Epic 16.1.6 - Enhanced Rating Stars Component
import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import './RatingStars.css';
interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  showCount?: boolean;
  reviewCount?: number;
  precision?: 'full' | 'half' | 'quarter';
  onChange?: (rating: number) => void;
  onHover?: (rating: number) => void;
  onLeave?: () => void;
  className?: string;
  disabled?: boolean;
  showTooltip?: boolean;
  export const RatingStars: React.FC<RatingStarsProps> = ({,)
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  showCount = false,
  reviewCount = 0,
  precision = 'half',
  onChange,
  onHover,
  onLeave,
  className = '',
  disabled = false,
  showTooltip = false
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const displayRating = hoverRating ?? rating;
  const handleStarClick = (starIndex: number, event: React.MouseEvent) => {,
  if (!interactive || disabled || !onChange) return;
  let newRating = starIndex + 1;
  if (precision === 'half') {
  const rect = event.currentTarget.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const starWidth = rect.width;
  if (clickX < starWidth / 2) {
  newRating = starIndex + 0.5;
} else if (precision === 'quarter') {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const starWidth = rect.width;
      const quarter = starWidth / 4;
      if (clickX < quarter) {
        newRating = starIndex + 0.25;
      } else if (clickX < quarter * 2) {
        newRating = starIndex + 0.5;
      } else if (clickX < quarter * 3) {
        newRating = starIndex + 0.75;
    onChange(newRating);
  };
  const handleStarHover = (starIndex: number, event: React.MouseEvent) => {
    if (!interactive || disabled) return;
    let hoverValue = starIndex + 1;
    if (precision === 'half') {
      const rect = event.currentTarget.getBoundingClientRect();
      const hoverX = event.clientX - rect.left;
      const starWidth = rect.width;
      if (hoverX < starWidth / 2) {
        hoverValue = starIndex + 0.5;
    setHoverRating(hoverValue);
    onHover?.(hoverValue);
  };
  const handleMouseLeave = () => {
    if (!interactive || disabled) return;
    setHoverRating(null);
    setTooltipVisible(false);
    onLeave?.();
  };
  const handleMouseEnter = () => {
    if (showTooltip) {
      setTooltipVisible(true);
  };
  const renderStar = (index: number) => {
    const filled = displayRating > index;
    const partialFill = displayRating > index && displayRating < index + 1;
    const fillPercentage = partialFill ? (displayRating - index) * 100 : 100;
    return;
      <div
        key={index}
        className={`star-container ${size} ${interactive ? 'interactive' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={(e) => handleStarClick(index, e)}
        onMouseMove={(e) => handleStarHover(index, e)}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={`${index + 1} star${index > 0 ? 's' : ''}`}
      >
        <StarOutlineIcon className="star-outline" />
        {filled && ()
          <div className="star-fill" style={{ width: `${fillPercentage}%` }}>}
            <StarIcon className="star-filled" />
          </div>
        )}
        {showTooltip && tooltipVisible && hoverRating === index + 1 && ()
          <div className="star-tooltip">
            {getRatingLabel(index + 1)}
          </div>
        )}
      </div>
    );
  };
  const getRatingLabel = (value: number): string => {
  const labels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};
    return labels[value] || `${value} stars`;}
  };
  const formatRating = (value: number): string => {
    if (value % 1 === 0) {
      return value.toString();
    return value.toFixed(1);
  };
  return;
    <div 
      className={`rating-stars ${className}`}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div className="stars-container">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>
      {showCount && ()
        <div className="rating-info">
          <span className="rating-value">{formatRating(rating)}</span>
          {reviewCount > 0 && ()
            <span className="review-count">
              ({reviewCount.toLocaleString()} review{reviewCount === 1 ? '' : 's'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Rating Distribution Component
interface RatingDistributionProps {
  distribution: {,
  five_star: number;,
  four_star: number;
  three_star: number;,
  two_star: number;
  one_star: number;
};
  totalReviews: number;
  onFilterByRating?: (rating: number) => void;

export const RatingDistribution: React.FC<RatingDistributionProps> = ({)
  distribution,
  totalReviews,
  onFilterByRating
}) => {
  const ratings = [5, 4, 3, 2, 1];
  const ratingKeys = ['five_star', 'four_star', 'three_star', 'two_star', 'one_star'] as const;
  const handleBarClick = (rating: number) => {,
  onFilterByRating?.(rating);
};
  return;
    <div className="rating-distribution">
      <h3>Rating Breakdown</h3>
      {ratings.map((rating, index) => {
        const count = distribution[ratingKeys[index]];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return;
          <div
            key={rating}
            className={`rating-bar ${onFilterByRating ? 'clickable' : ''}`}
            onClick={() => handleBarClick(rating)}
          >
            <div className="rating-label">
              <span className="rating-stars-small">
                {rating}
                <StarIcon className="star-icon-small" />
              </span>
            </div>
            <div className="rating-progress">
              <div
                className="rating-progress-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="rating-count">
              {count.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Rating Summary Component
interface RatingSummaryProps {
  averageRating: number;,
  totalReviews: number;
  distribution: {,
  five_star: number;,
  four_star: number;
  three_star: number;,
  two_star: number;
  one_star: number;
};
  verifiedPercentage?: number;
  onFilterByRating?: (rating: number) => void;
  className?: string;

export const RatingSummary: React.FC<RatingSummaryProps> = ({)
  averageRating,
  totalReviews,
  distribution,
  verifiedPercentage,
  onFilterByRating,
  className = ''
}) => {
  return;
    <div className={`rating-summary ${className}`}>}
      <div className="rating-overview">
        <div className="average-rating">
          <span className="rating-number">{averageRating.toFixed(1)}</span>
          <RatingStars
            rating={averageRating}
            size="lg"
            showCount={false}
          />
          <span className="total-reviews">
            {totalReviews.toLocaleString()} review{totalReviews === 1 ? '' : 's'}
          </span>
        </div>
        {verifiedPercentage !== undefined && ()
          <div className="verified-purchases">
            <span className="verified-percentage">
              {verifiedPercentage.toFixed(0)}%
            </span>
            <span className="verified-label">verified purchases</span>
          </div>
        )}
      </div>
      <RatingDistribution
        distribution={distribution}
        totalReviews={totalReviews}
        onFilterByRating={onFilterByRating}
      />
    </div>
  );
};