// Epic 16.2.1 Submission Review Component (for moderators)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SubmissionReview.css';
interface SubmissionData {
  title: string;
  description: string;
  tags: string[];
  categories: string[];
  price_cents: number;
  is_ai_generated: boolean;
  claude_compat: string[];
  claude_model: string;
  graph_json: Record<string, unknown>;
  prompt_yaml?: string;
  changelog_md?: string;
  token_per_run_estimate: number;
  intended_use_cases: string[];
  technical_requirements: string[];
  example_outputs: string[];
  documentation_md?: string;
  moderation_notes?: string;
  is_first_submission: boolean;
  previous_version_id?: string;
}
interface ValidationResult {
  id: string;
  rule_id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: Record<string, unknown>;
  suggested_fix?: string;
  auto_fixable: boolean;
  location?: {
    field?: string;
  };
}
interface SubmissionDetails {
  id: string;
  template_id: string;
  submitter_id: string;
  version_number: number;
  status: 'draft' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected';
  submission_data: SubmissionData;
  validation_results: ValidationResult[];
  reviewer_id?: string;
  review_comments?: string;
  review_score?: number;
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}
interface ReviewFeedback {
  category: 'content' | 'quality' | 'compliance' | 'usability' | 'technical';
  rating: number;
  comments: string;
  suggestions: string[];
}
const FEEDBACK_CATEGORIES = [;
  { id: 'content', label: 'Content Quality', description: 'Originality, usefulness, and relevance' },
  { id: 'quality', label: 'Technical Quality', description: 'Code structure, performance, and reliability' },
  { id: 'compliance', label: 'Policy Compliance', description: 'Adherence to platform guidelines and policies' },
  { id: 'usability', label: 'User Experience', description: 'Ease of use, documentation, and examples' },
  { id: 'technical', label: 'Technical Implementation', description: 'Claude compatibility and technical accuracy' }
];

export const SubmissionReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'changes_requested' | ''>('');
  const [overallScore, setOverallScore] = useState(75);
  const [comments, setComments] = useState('');
  const [detailedFeedback, setDetailedFeedback] = useState<ReviewFeedback[]>()
    FEEDBACK_CATEGORIES.map(cat => ({)
      category: cat.id as 'content' | 'quality' | 'compliance' | 'usability' | 'technical',
      rating: 3,
      comments: '',
      suggestions: [],
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (id) {
      fetchSubmission(id);
    }
  }, [id]);
  const fetchSubmission = async (submissionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/marketplace/submissions/${submissionId}`, {)}
        headers: {,
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch submission');
      }
      const data = await response.json();
      setSubmission(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submission');
    } finally {
      setIsLoading(false);
    }
  };
  const handleFeedbackChange = (index: number, field: keyof ReviewFeedback, value: Error) => {
    const updated = [...detailedFeedback];
    updated[index] = { ...updated[index], [field]: value };
    setDetailedFeedback(updated);
  };
  const handleSuggestionChange = (feedbackIndex: number, suggestionIndex: number, value: string) => {
    const updated = [...detailedFeedback];
    updated[feedbackIndex].suggestions[suggestionIndex] = value;
    setDetailedFeedback(updated);
  };
  const addSuggestion = (feedbackIndex: number) => {
    const updated = [...detailedFeedback];
    updated[feedbackIndex].suggestions.push('');
    setDetailedFeedback(updated);
  };
  const removeSuggestion = (feedbackIndex: number, suggestionIndex: number) => {
    const updated = [...detailedFeedback];
    updated[feedbackIndex].suggestions.splice(suggestionIndex, 1);
    setDetailedFeedback(updated);
  };
  const handleSubmitReview = async () => {
    if (!decision || !comments.trim()) {
      alert('Please provide a decision and comments');
      return;
    }
    if (!submission) return;
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/marketplace/submissions/${submission.id}/review`, {)}
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        },
        body: JSON.stringify({),
          decision,
          score: overallScore,
          comments,
          detailed_feedback: detailedFeedback.filter(f => f.comments.trim()),
        })
      });
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      navigate('/marketplace/admin/review-queue');
    } catch (err) {
      console.error('Review submission failed:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {)
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const formatPrice = (cents: number) => {
    return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;}
  };
  const getValidationSummary = (validation: ValidationResult[]) => {
    const errors = validation.filter(v => v.severity === 'error').length;
    const warnings = validation.filter(v => v.severity === 'warning').length;
    const info = validation.filter(v => v.severity === 'info').length;
    return { errors, warnings, info };
  };
  if (isLoading) {
    return ()
      <div className="submission-review loading">
        <div className="loading-spinner">Loading submission...</div>
      </div>
    );
  }
  if (error) {
    return ()
      <div className="submission-review error">
        <div className="error-message">
          <h3>Error loading submission</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/marketplace/admin/review-queue')}>
            Back to Review Queue
          </button>
        </div>
      </div>
    );
  }
  if (!submission) {
    return ()
      <div className="submission-review error">
        <div className="error-message">
          <h3>Submission not found</h3>
          <button onClick={() => navigate('/marketplace/admin/review-queue')}>
            Back to Review Queue
          </button>
        </div>
      </div>
    );
  }
  const validation = getValidationSummary(submission.validation_results);
  const data = submission.submission_data;
  return ()
    <div className="submission-review">
      <div className="review-header">
        <div className="submission-info">
          <h2>{data.title}</h2>
          <div className="submission-meta">
            <span className="version">Version {submission.version_number}</span>
            <span className="status">{submission.status}</span>
            <span className="submitted-date">
              Submitted: {submission.submitted_at ? formatDate(submission.submitted_at) : 'N/A'}
            </span>
          </div>
        </div>
        <div className="review-actions">
          <button 
            className="btn-secondary"
            onClick={() => navigate('/marketplace/admin/review-queue')}
          >
            Back to Queue
          </button>
        </div>
      </div>
      <div className="review-content">
        <div className="submission-details">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Title</label>
                <div>{data.title}</div>
              </div>
              <div className="detail-item">
                <label>Price</label>
                <div>{formatPrice(data.price_cents)}</div>
              </div>
              <div className="detail-item">
                <label>AI Generated</label>
                <div>{data.is_ai_generated ? 'Yes' : 'No'}</div>
              </div>
              <div className="detail-item">
                <label>Claude Model</label>
                <div>{data.claude_model}</div>
              </div>
            </div>
            <div className="detail-item full-width">
              <label>Description</label>
              <div className="description-text">{data.description}</div>
            </div>
            <div className="detail-item">
              <label>Tags</label>
              <div className="tags-list">
                {data.tags.map(tag => ()
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="detail-section">
            <h3>Technical Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Token Estimate</label>
                <div>{data.token_per_run_estimate.toLocaleString()}</div>
              </div>
              <div className="detail-item">
                <label>Claude Compatibility</label>
                <div>{data.claude_compat.join(', ')}</div>
              </div>
            </div>
            <div className="detail-item">
              <label>Graph JSON</label>
              <div className="code-preview">
                <pre>{JSON.stringify(data.graph_json, null, 2)}</pre>
              </div>
            </div>
            {data.prompt_yaml && ()
              <div className="detail-item">
                <label>Prompt YAML</label>
                <div className="code-preview">
                  <pre>{data.prompt_yaml}</pre>
                </div>
              </div>
            )}
          </div>
          <div className="detail-section">
            <h3>Content Information</h3>
            <div className="detail-item">
              <label>Intended Use Cases</label>
              <ul>
                {data.intended_use_cases.map((useCase, index) => ()
                  <li key={index}>{useCase}</li>
                ))}
              </ul>
            </div>
            <div className="detail-item">
              <label>Example Outputs</label>
              {data.example_outputs.map((output, index) => ()
                <div key={index} className="example-output">
                  <strong>Example {index + 1}:</strong>
                  <p>{output}</p>
                </div>
              ))}
            </div>
            {data.technical_requirements.length > 0 && ()
              <div className="detail-item">
                <label>Technical Requirements</label>
                <ul>
                  {data.technical_requirements.map((req, index) => ()
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.documentation_md && ()
              <div className="detail-item">
                <label>Documentation</label>
                <div className="documentation-preview">
                  <pre>{data.documentation_md}</pre>
                </div>
              </div>
            )}
            {data.moderation_notes && ()
              <div className="detail-item">
                <label>Moderation Notes</label>
                <div className="moderation-notes">{data.moderation_notes}</div>
              </div>
            )}
          </div>
          {submission.validation_results.length > 0 && ()
            <div className="detail-section">
              <h3>Validation Results</h3>
              <div className="validation-summary">
                <div className="validation-count errors">
                  {validation.errors} Error{validation.errors !== 1 ? 's' : ''}
                </div>
                <div className="validation-count warnings">
                  {validation.warnings} Warning{validation.warnings !== 1 ? 's' : ''}
                </div>
                <div className="validation-count info">
                  {validation.info} Info
                </div>
              </div>
              <div className="validation-details">
                {submission.validation_results.map(result => ()
                  <div key={result.id} className={`validation-item ${result.severity}`}>}
                    <div className="validation-header">
                      <span className="severity">{result.severity}</span>
                      <span className="message">{result.message}</span>
                    </div>
                    {result.suggested_fix && ()
                      <div className="suggested-fix">
                        <strong>Suggested Fix:</strong> {result.suggested_fix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="review-form">
          <h3>Review & Decision</h3>
          <div className="form-section">
            <label>Decision *</label>
            <div className="decision-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="decision"
                  value="approved"
                  checked={decision === 'approved'}
                  onChange={(e) => setDecision(e.target.value as 'approved' | 'rejected' | 'changes_requested' | '')}
                />
                <span className="approve">Approve</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="decision"
                  value="changes_requested"
                  checked={decision === 'changes_requested'}
                  onChange={(e) => setDecision(e.target.value as 'approved' | 'rejected' | 'changes_requested' | '')}
                />
                <span className="changes">Request Changes</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="decision"
                  value="rejected"
                  checked={decision === 'rejected'}
                  onChange={(e) => setDecision(e.target.value as 'approved' | 'rejected' | 'changes_requested' | '')}
                />
                <span className="reject">Reject</span>
              </label>
            </div>
          </div>
          <div className="form-section">
            <label>Overall Score (1-100) *</label>
            <input
              type="range"
              min="1"
              max="100"
              value={overallScore}
              onChange={(e) => setOverallScore(parseInt(e.target.value))}
            />
            <div className="score-display">{overallScore}/100</div>
          </div>
          <div className="form-section">
            <label>Comments *</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide detailed feedback for the submitter..."
              rows={4}
              maxLength={2000}
            />
            <small>{comments.length}/2000 characters</small>
          </div>
          <div className="form-section">
            <label>Detailed Feedback</label>
            <div className="feedback-sections">
              {FEEDBACK_CATEGORIES.map((category, index) => ()
                <div key={category.id} className="feedback-section">
                  <h4>{category.label}</h4>
                  <p className="category-description">{category.description}</p>
                  <div className="rating-input">
                    <label>Rating (1-5)</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={detailedFeedback[index].rating}
                      onChange={(e) => handleFeedbackChange(index, 'rating', parseInt(e.target.value))}
                    />
                    <span className="rating-value">{detailedFeedback[index].rating}/5</span>
                  </div>
                  <div className="comments-input">
                    <textarea
                      value={detailedFeedback[index].comments}
                      onChange={(e) => handleFeedbackChange(index, 'comments', e.target.value)}
                      placeholder={`Comments on ${category.label.toLowerCase()}...`}
                      rows={2}
                      maxLength={1000}
                    />
                  </div>
                  <div className="suggestions-input">
                    <label>Suggestions</label>
                    {detailedFeedback[index].suggestions.map((suggestion, suggestionIndex) => ()
                      <div key={suggestionIndex} className="suggestion-item">
                        <input
                          type="text"
                          value={suggestion}
                          onChange={(e) => handleSuggestionChange(index, suggestionIndex, e.target.value)}
                          placeholder="Suggestion for improvement..."
                        />
                        <button 
                          type="button"
                          onClick={() => removeSuggestion(index, suggestionIndex)}
                          className="remove-suggestion"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => addSuggestion(index)}
                      className="add-suggestion"
                    >
                      Add Suggestion
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button 
              className="btn-primary"
              onClick={handleSubmitReview}
              disabled={!decision || !comments.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReview;