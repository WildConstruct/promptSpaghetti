// Epic 16 Marketplace - Star Rating Component
import React from 'react';
import './StarRating.css';


interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  export const StarRating: React.FC<StarRatingProps> = ({),
  rating,
  maxRating = 5,
  size = 'medium',
  interactive = false,
  onRatingChange,
  className = ''


}) => {
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);
  const handleStarClick = (starRating: number) => {,
  if (interactive && onRatingChange) {
  onRatingChange(starRating);
};
  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoveredRating(starRating);
  };
  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredRating(null);
  };
  const getStarFill = (starIndex: number): 'empty' | 'half' | 'full' => {
  const effectiveRating = hoveredRating !== null ? hoveredRating : rating;
  const starValue = starIndex + 1;
  if (effectiveRating >= starValue) {
  return 'full';
 else if (effectiveRating >= starValue - 0.5) {
      return 'half';
 else {
      return 'empty';
  };
  const renderStar = (index: number) => {
    const fill = getStarFill(index);
    const starValue = index + 1;
    return;
      <button
        key={index}
        type="button"
        className={`star ${fill} ${interactive ? 'interactive' : ''}`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        disabled={!interactive}
        aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="star-svg"
        >
          {fill === 'half' && ()
            <defs>
              <linearGradient id={`half-fill-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">}
                <stop offset="50%" stopColor="var(--star-fill-color)" />
                <stop offset="50%" stopColor="var(--star-empty-color)" />
              </linearGradient>
            </defs>
          )}
          <path
            d="M8 1L10.09 5.26L15 6.09L11.5 9.47L12.18 14.37L8 12.18L3.82 14.37L4.5 9.47L1 6.09L5.91 5.26L8 1Z"
            fill={
              fill === 'full' 
                ? 'var(--star-fill-color)' 
                : fill === 'half' 
                  ? `url(#half-fill-${index})` }
                  : 'var(--star-empty-color)'
            stroke="var(--star-stroke-color)"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  };
  return;
    <div 
      className={`star-rating ${size} ${interactive ? 'interactive' : ''} ${className}`}
      onMouseLeave={handleMouseLeave}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${rating} out of ${maxRating} stars`}
    >
      <div className="stars">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>
      {!interactive && ()
        <span className="rating-value" aria-hidden="true">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};