/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// Epic 16 Marketplace - Review List Component
import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './ReviewList.css';


interface Review {
  id: string;,
  buyer_id: string;,
  buyer_name: string;,
  stars: number;
  comment?: string;
  created_at: string;,
  helpful_count: number;,
  verified_purchase: boolean;
  interface ReviewListProps {
  reviews: Review;,
  templateId: string;
  onReviewAdded?: () => void;
  className?: string;
  interface NewReview {
  stars: number;,
  comment: string;
  export const ReviewList: React.FC<ReviewListProps> = ({),
  reviews,
  templateId,
  onReviewAdded,
  className = ''


}) => {
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState<NewReview>({ stars: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const handleSubmitReview = async () => {
    if (newReview.stars < 1 || newReview.stars > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    if (newReview.comment.trim().length < 10) {
      setError('Please write a review with at least 10 characters');
      return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/marketplace/reviews', {)
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`}
  },
  body: JSON.stringify({);
  template_id: templateId,
  stars: newReview.stars,
  comment: newReview.comment.trim(),

      });
      if (response.ok) {
        setNewReview({ stars: 5, comment: '' });
        setShowAddReview(false);
        onReviewAdded?.();
 else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit review');
 catch (_err) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  console.debug('Review submission error:', _err);
  setError('Failed to submit review');
 finally {
      setSubmitting(false);
  };
  const sortedReviews = [...reviews].sort((a, b) => {
  switch (sortBy) {
  case 'newest':,
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  case 'oldest':,
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  case 'highest':,
  return b.stars - a.stars;
  case 'lowest':,
  return a.stars - b.stars;
  default:,
  return 0;
});
  const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {)
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
  };
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.stars, 0);
    return total / reviews.length;
  };
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {)
  distribution[review.stars as keyof typeof distribution]++;
    });
    return distribution;
  };
  return;
    <div className={`review-list ${className}`}>}
      {/* Review Summary */}
      <div className="review-summary">
        <div className="summary-header">
          <h3>Customer Reviews</h3>
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="add-review-button"
          >
            Write a Review
          </button>
        </div>
        {reviews.length > 0 ? ()
          <div className="summary-stats">
            <div className="overall-rating">
              <div className="rating-display">
                <span className="rating-number">{calculateAverageRating().toFixed(1)}</span>
                <div className="rating-stars">
                  <StarRating rating={calculateAverageRating()} />
                </div>
              </div>
              <span className="review-count">Based on {reviews.length} reviews</span>
            </div>
            <div className="rating-breakdown">
              {Object.entries(getRatingDistribution())
                .reverse()
                .map(([stars, count]) => {
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return;
                    <div key={stars} className="rating-bar">
                      <span className="bar-label">{stars}★</span>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="bar-count">({count})</span>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : ()
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this template!</p>
          </div>
        )}
      </div>
      {/* Add Review Form */}
      {showAddReview && ()
        <div className="add-review-form">
          <h4>Write a Review</h4>
          {error && ()
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {error}
            </div>
          )}
          <div className="form-group">
            <label>Rating</label>
            <div className="star-selector">
              {[1, 2, 3, 4, 5].map((star) => ()
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, stars: star })}
                  className={`star-button ${star <= newReview.stars ? 'active' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="comment">Your Review</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience with this template..."
              rows={4}
              maxLength={2000}
            />
            <div className="character-count">
              {newReview.comment.length}/2000 characters
            </div>
          </div>
          <div className="form-actions">
            <button
              onClick={() => setShowAddReview(false)}
              className="cancel-button"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              className="submit-button"
              disabled={submitting || newReview.comment.trim().length < 10}
            >
              {submitting ? ()
                <>
                  <LoadingSpinner size="small" />
                  Submitting...
                </>
              ) : ()
                'Submit Review'
              )}
            </button>
          </div>
        </div>
      )}
      {/* Reviews List */}
      {reviews.length > 0 && ()
        <div className="reviews-section">
          <div className="reviews-header">
            <h4>Reviews ({reviews.length})</h4>
            <div className="sort-controls">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>
          <div className="reviews-list">
            {sortedReviews.map((review) => ()
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.buyer_name}</span>
                    {review.verified_purchase && ()
                      <span className="verified-badge" title="Verified Purchase">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M6 8L7 9L10 6M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
                            stroke="#10B981"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="review-meta">
                    <StarRating rating={review.stars} />
                    <span className="review-date">{formatDate(review.created_at)}</span>
                  </div>
                </div>
                {review.comment && ()
                  <div className="review-content">
                    <p>{review.comment}</p>
                  </div>
                )}
                <div className="review-footer">
                  <button 
                    className="helpful-button"
                    title="Mark as helpful"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M14 6L7 13L2 8L3.5 6.5L7 10L12.5 4.5L14 6Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Helpful ({review.helpful_count})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};