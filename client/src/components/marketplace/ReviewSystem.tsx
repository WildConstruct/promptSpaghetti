// Epic 16.1.6 - Comprehensive Review System Component
import React, { useState, useEffect, useCallback } from 'react';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  FlagIcon,
  PencilIcon,
  // TrashIcon,
  UserIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  // PhotoIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon
} from '@heroicons/react/24/solid';
import { RatingStars, RatingSummary } from './RatingStars';
import { Badge } from './Badge';
import { Modal } from './Modal';
import './ReviewSystem.css';

// Types
interface Review {
  id: string;
  template_id: string;
  buyer_id: string;
  stars: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  use_case?: string;
  difficulty_rating?: number;
  would_recommend: boolean;
  verified_purchase: boolean;
  created_at: Date;
  updated_at: Date;
  buyer?: {
    id: string;
    name: string;
    avatar_url?: string;
    verified: boolean;
    total_reviews: number;
  };
  helpfulness_votes: {,
    helpful: number;
    not_helpful: number;
    user_vote?: 'helpful' | 'not_helpful';
  };
  creator_response?: {
    id: string;
    creator_id: string;
    response: string;
    created_at: Date;
  };
  attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'file';
    url: string;
    thumbnail_url?: string;
    filename: string;
  }>;
}
interface ReviewSystemProps {
  templateId: string;
  templateTitle: string;
  templateOwnerId: string;
  currentUserId?: string;
  isOwner?: boolean;
  userHasPurchased?: boolean;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({)
  templateId,
  templateTitle,
  // templateOwnerId, // Commented out unused prop
  currentUserId,
  isOwner = false,
  userHasPurchased = false
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [metrics, setMetrics] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({)
        page: currentPage.toString(),
        sort_by: sortBy,
        filter_by: filterBy,
      });
      const response = await fetch(`/api/marketplace/templates/${templateId}/reviews?${params}`);}
      const data = await response.json();
      setReviews(data.reviews);
      setMetrics(data.metrics);
      setTotalPages(Math.ceil(data.total / 20));
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [templateId, currentPage, sortBy, filterBy]);
  const handleReviewSubmit = async (reviewData: unknown) => {
    try {
      const response = await fetch('/api/marketplace/reviews', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({),
          ...reviewData,
          template_id: templateId,
        })
      });
      if (response.ok) {
        setShowReviewModal(false);
        loadReviews();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };
  const handleHelpfulnessVote = async (reviewId: string, vote: 'helpful' | 'not_helpful') => {
    try {
      const response = await fetch('/api/marketplace/reviews/helpfulness', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({),
          review_id: reviewId,
          vote
        })
      });
      if (response.ok) {
        loadReviews();
      }
    } catch (error) {
      console.error('Failed to vote on helpfulness:', error);
    }
  };
  const handleReviewFlag = async (reviewId: string, flagType: string, reason?: string) => {
    try {
      const response = await fetch('/api/marketplace/reviews/flag', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({),
          review_id: reviewId,
          flag_type: flagType,
          reason
        })
      });
      if (response.ok) {
        loadReviews();
      }
    } catch (error) {
      console.error('Failed to flag review:', error);
    }
  };
  const handleCreatorResponse = async (reviewId: string, response: string) => {
    try {
      const responseData = await fetch('/api/marketplace/reviews/response', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({),
          review_id: reviewId,
          response
        })
      });
      if (responseData.ok) {
        loadReviews();
      }
    } catch (error) {
      console.error('Failed to submit creator response:', error);
    }
  };
  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }
  return ()
    <div className="review-system">
      {/* Review Summary */}
      {metrics && ()
        <div className="review-summary-section">
          <RatingSummary
            averageRating={metrics.average_rating}
            totalReviews={metrics.total_reviews}
            distribution={metrics.rating_distribution}
            verifiedPercentage={metrics.verified_percentage}
            onFilterByRating={(rating) => setFilterBy(`${rating}_star`)}
          />
        </div>
      )}
      {/* Review Controls */}
      <div className="review-controls">
        <div className="review-filters">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="review-sort-select"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest_rated">Highest Rated</option>
            <option value="lowest_rated">Lowest Rated</option>
            <option value="most_helpful">Most Helpful</option>
            <option value="verified_first">Verified First</option>
          </select>
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
            className="review-filter-select"
          >
            <option value="all">All Reviews</option>
            <option value="verified_only">Verified Only</option>
            <option value="with_comments">With Comments</option>
            <option value="five_star">5 Stars</option>
            <option value="four_star">4 Stars</option>
            <option value="three_star">3 Stars</option>
            <option value="two_star">2 Stars</option>
            <option value="one_star">1 Star</option>
          </select>
        </div>
        {userHasPurchased && currentUserId && ()
          <button 
            onClick={() => setShowReviewModal(true)}
            className="btn btn-primary"
          >
            Write a Review
          </button>
        )}
      </div>
      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? ()
          <div className="no-reviews">
            <ChatBubbleLeftRightIcon className="no-reviews-icon" />
            <h3>No reviews yet</h3>
            <p>Be the first to review this template!</p>
          </div>
        ) : ()
          reviews.map((review) => ()
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              isOwner={isOwner}
              onHelpfulnessVote={handleHelpfulnessVote}
              onFlag={handleReviewFlag}
              onCreatorResponse={handleCreatorResponse}
              onEdit={() => setEditingReview(review)}
            />
          ))
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && ()
        <div className="reviews-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
      {/* Review Modal */}
      {showReviewModal && ()
        <ReviewModal
          templateId={templateId}
          templateTitle={templateTitle}
          editingReview={editingReview}
          onSubmit={handleReviewSubmit}
          onClose={() => {
            setShowReviewModal(false);
            setEditingReview(null);
          }}
        />
      )}
    </div>
  );
};

// Review Card Component
interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  isOwner?: boolean;
  onHelpfulnessVote: (reviewId: string, vote: 'helpful' | 'not_helpful') => void;
  onFlag: (reviewId: string, flagType: string, reason?: string) => void;
  onCreatorResponse: (reviewId: string, response: string) => void;
  onEdit: () => void;
}
const ReviewCard: React.FC<ReviewCardProps> = ({)
  review,
  currentUserId,
  isOwner,
  onHelpfulnessVote,
  onFlag,
  onCreatorResponse,
  onEdit
}) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const isOwnReview = currentUserId === review.buyer_id;
  const canRespond = isOwner && !review.creator_response;
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {)
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };
  const handleResponseSubmit = () => {
    if (responseText.trim()) {
      onCreatorResponse(review.id, responseText);
      setResponseText('');
      setShowResponseForm(false);
    }
  };
  return ()
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.buyer?.avatar_url ? ()
              <img src={review.buyer.avatar_url} alt={review.buyer.name} />
            ) : ()
              <UserIcon className="avatar-icon" />
            )}
          </div>
          <div className="reviewer-details">
            <div className="reviewer-name">
              {review.buyer?.name || 'Anonymous'}
              {review.buyer?.verified && <CheckBadgeIcon className="verified-icon" />}
            </div>
            <div className="review-meta">
              <span className="review-date">{formatDate(review.created_at)}</span>
              {review.verified_purchase && ()
                <Badge variant="success" size="sm">Verified Purchase</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="review-actions">
          {isOwnReview && ()
            <button onClick={onEdit} className="action-btn" aria-label="Edit review">
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {currentUserId && !isOwnReview && ()
            <button 
              onClick={() => setShowFlagModal(true)} 
              className="action-btn"
              aria-label="Flag review"
            >
              <FlagIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="review-content">
        <div className="review-rating">
          <RatingStars rating={review.stars} size="md" />
          {review.title && <h4 className="review-title">{review.title}</h4>}
        </div>
        {review.comment && ()
          <p className="review-comment">{review.comment}</p>
        )}
        {(review.pros && review.pros.length > 0) && ()
          <div className="review-pros-cons">
            <div className="pros">
              <h5>Pros:</h5>
              <ul>
                {review.pros.map((pro, index) => ()
                  <li key={index}>{pro}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {(review.cons && review.cons.length > 0) && ()
          <div className="review-pros-cons">
            <div className="cons">
              <h5>Cons:</h5>
              <ul>
                {review.cons.map((con, index) => ()
                  <li key={index}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {review.use_case && ()
          <div className="review-use-case">
            <strong>Use case:</strong> {review.use_case}
          </div>
        )}
        {review.difficulty_rating && ()
          <div className="review-difficulty">
            <strong>Difficulty:</strong>
            <RatingStars rating={review.difficulty_rating} size="sm" maxRating={5} />
          </div>
        )}
        <div className="review-recommendation">
          {review.would_recommend ? ()
            <span className="recommend-yes">👍 Recommends this template</span>
          ) : ()
            <span className="recommend-no">👎 Doesn&apos;t recommend this template</span>
          )}
        </div>
      </div>
      {/* Helpfulness Voting */}
      {currentUserId && !isOwnReview && ()
        <div className="review-helpfulness">
          <span className="helpfulness-label">Was this review helpful?</span>
          <div className="helpfulness-buttons">
            <button
              onClick={() => onHelpfulnessVote(review.id, 'helpful')}
              className={`helpfulness-btn ${review.helpfulness_votes.user_vote === 'helpful' ? 'active' : ''}`}
            >
              {review.helpfulness_votes.user_vote === 'helpful' ? 
                <HandThumbUpSolidIcon className="w-4 h-4" /> : 
                <HandThumbUpIcon className="w-4 h-4" />
              }
              Yes ({review.helpfulness_votes.helpful})
            </button>
            <button
              onClick={() => onHelpfulnessVote(review.id, 'not_helpful')}
              className={`helpfulness-btn ${review.helpfulness_votes.user_vote === 'not_helpful' ? 'active' : ''}`}
            >
              {review.helpfulness_votes.user_vote === 'not_helpful' ? 
                <HandThumbDownSolidIcon className="w-4 h-4" /> : 
                <HandThumbDownIcon className="w-4 h-4" />
              }
              No ({review.helpfulness_votes.not_helpful})
            </button>
          </div>
        </div>
      )}
      {/* Creator Response */}
      {review.creator_response && ()
        <div className="creator-response">
          <div className="response-header">
            <strong>Creator Response</strong>
            <span className="response-date">{formatDate(review.creator_response.created_at)}</span>
          </div>
          <p className="response-text">{review.creator_response.response}</p>
        </div>
      )}
      {/* Creator Response Form */}
      {canRespond && ()
        <div className="creator-response-section">
          {showResponseForm ? ()
            <div className="response-form">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Respond to this review..."
                className="response-textarea"
                rows={3}
              />
              <div className="response-actions">
                <button onClick={handleResponseSubmit} className="btn btn-primary btn-sm">
                  Submit Response
                </button>
                <button onClick={() => setShowResponseForm(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : ()
            <button onClick={() => setShowResponseForm(true)} className="btn btn-outline btn-sm">
              Respond to Review
            </button>
          )}
        </div>
      )}
      {/* Flag Modal */}
      {showFlagModal && ()
        <FlagModal
          reviewId={review.id}
          onFlag={onFlag}
          onClose={() => setShowFlagModal(false)}
        />
      )}
    </div>
  );
};

// Review Modal Component
interface ReviewModalProps {
  templateId: string;
  templateTitle: string;
  editingReview?: Review | null;
  onSubmit: (reviewData: unknown) => void;
  onClose: () => void;
}
const ReviewModal: React.FC<ReviewModalProps> = ({)
  // templateId, // Commented out unused prop
  templateTitle,
  editingReview,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({)
    stars: editingReview?.stars || 5,
    title: editingReview?.title || '',
    comment: editingReview?.comment || '',
    pros: editingReview?.pros || [],
    cons: editingReview?.cons || [],
    use_case: editingReview?.use_case || '',
    difficulty_rating: editingReview?.difficulty_rating || 3,
    would_recommend: editingReview?.would_recommend ?? true,
  });
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  const addPro = () => {
    if (newPro.trim()) {
      setFormData(prev => ({)
        ...prev,
        pros: [...prev.pros, newPro.trim()]
      }));
      setNewPro('');
    }
  };
  const addCon = () => {
    if (newCon.trim()) {
      setFormData(prev => ({)
        ...prev,
        cons: [...prev.cons, newCon.trim()]
      }));
      setNewCon('');
    }
  };
  const removePro = (index: number) => {
    setFormData(prev => ({)
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };
  const removeCon = (index: number) => {
    setFormData(prev => ({)
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };
  return ()
    <Modal onClose={onClose} className="review-modal">
      <div className="modal-header">
        <h2>{editingReview ? 'Edit Review' : 'Write a Review'}</h2>
        <p className="modal-subtitle">for {templateTitle}</p>
      </div>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label>Rating *</label>
          <RatingStars
            rating={formData.stars}
            size="lg"
            interactive
            showTooltip
            onChange={(rating) => setFormData(prev => ({ ...prev, stars: rating }))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="title">Review Title (Optional)</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Summarize your experience..."
            maxLength={200}
          />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Your Review</label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Share your thoughts about this template..."
            rows={6}
            maxLength={2000}
          />
          <div className="character-count">{formData.comment.length}/2000</div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Pros</label>
            <div className="pros-cons-input">
              <input
                type="text"
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                placeholder="What did you like?"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
              />
              <button type="button" onClick={addPro} className="btn btn-sm btn-secondary">
                Add
              </button>
            </div>
            <div className="pros-cons-list">
              {formData.pros.map((pro, index) => ()
                <div key={index} className="pros-cons-item">
                  <span>+ {pro}</span>
                  <button type="button" onClick={() => removePro(index)} className="remove-btn">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Cons</label>
            <div className="pros-cons-input">
              <input
                type="text"
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                placeholder="What could be improved?"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
              />
              <button type="button" onClick={addCon} className="btn btn-sm btn-secondary">
                Add
              </button>
            </div>
            <div className="pros-cons-list">
              {formData.cons.map((con, index) => ()
                <div key={index} className="pros-cons-item">
                  <span>- {con}</span>
                  <button type="button" onClick={() => removeCon(index)} className="remove-btn">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="use_case">Use Case (Optional)</label>
          <input
            type="text"
            id="use_case"
            value={formData.use_case}
            onChange={(e) => setFormData(prev => ({ ...prev, use_case: e.target.value }))}
            placeholder="How did you use this template?"
            maxLength={500}
          />
        </div>
        <div className="form-group">
          <label>Difficulty Rating</label>
          <p className="form-help">How challenging was this template to use?</p>
          <RatingStars
            rating={formData.difficulty_rating}
            size="md"
            interactive
            showTooltip
            onChange={(rating) => setFormData(prev => ({ ...prev, difficulty_rating: rating }))}
          />
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.would_recommend}
              onChange={(e) => setFormData(prev => ({ ...prev, would_recommend: e.target.checked }))}
            />
            I would recommend this template to others
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {editingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Flag Modal Component
interface FlagModalProps {
  reviewId: string;
  onFlag: (reviewId: string, flagType: string, reason?: string) => void;
  onClose: () => void;
}
const FlagModal: React.FC<FlagModalProps> = ({ reviewId, onFlag, onClose }) => {
  const [flagType, setFlagType] = useState('inappropriate');
  const [reason, setReason] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFlag(reviewId, flagType, reason);
    onClose();
  };
  return ()
    <Modal onClose={onClose} className="flag-modal">
      <div className="modal-header">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
        <h2>Flag Review</h2>
        <p className="modal-subtitle">Help us maintain quality by reporting inappropriate content</p>
      </div>
      <form onSubmit={handleSubmit} className="flag-form">
        <div className="form-group">
          <label>Reason for flagging *</label>
          <select
            value={flagType}
            onChange={(e) => setFlagType(e.target.value)}
            className="form-select"
          >
            <option value="inappropriate">Inappropriate content</option>
            <option value="spam">Spam or promotional</option>
            <option value="fake">Fake or misleading</option>
            <option value="off_topic">Off-topic</option>
            <option value="harassment">Harassment or abuse</option>
            <option value="copyright">Copyright violation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="reason">Additional details (optional)</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide more details about why you're flagging this review..."
            rows={3}
            maxLength={500}
          />
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-danger">
            Flag Review
          </button>
        </div>
      </form>
    </Modal>
  );
};