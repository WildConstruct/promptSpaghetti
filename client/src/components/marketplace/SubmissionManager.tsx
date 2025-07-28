// Epic 16.2.1 Submission Manager Component
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SubmissionManager.css';
interface Submission {
  id: string;
  template_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected';
  version_number: number;
  submission_data: {,
    title: string;
    description: string;
    price_cents: number;
  };
  validation_results: ValidationResult[];
  review_comments?: string;
  review_score?: number;
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}
interface ValidationResult {
  severity: 'error' | 'warning' | 'info';
  message: string;
}
interface SubmissionStats {
  total_submissions: number;
  approved_submissions: number;
  rejected_submissions: number;
  pending_submissions: number;
  avg_review_score: number;
  avg_review_time_hours: number;
}
const STATUS_COLORS = {
  draft: '#6b7280',
  submitted: '#3b82f6',
  under_review: '#f59e0b',
  changes_requested: '#ef4444',
  approved: '#10b981',
  rejected: '#ef4444',
};
const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const SubmissionManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'drafts' | 'submitted' | 'approved' | 'rejected'>('all');
  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, []);
  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/marketplace/submissions', {)
        headers: {,
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setIsLoading(false);
    }
  };
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/marketplace/submissions/stats', {)
        headers: {,
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };
  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    try {
      const response = await fetch(`/api/marketplace/submissions/${id}`, {)}
        method: 'DELETE',
        headers: {,
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      });
      if (response.ok) {
        setSubmissions(submissions.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete submission:', err);
    }
  };
  const handleResubmit = async (id: string) => {
    try {
      const response = await fetch(`/api/marketplace/submissions/${id}/submit`, {)}
        method: 'POST',
        headers: {,
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      });
      if (response.ok) {
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Failed to resubmit:', err);
    }
  };
  const getFilteredSubmissions = () => {
    switch (selectedTab) {
    case 'drafts':
      return submissions.filter(s => s.status === 'draft');
    case 'submitted':
      return submissions.filter(s => s.status === 'submitted' || s.status === 'under_review');
    case 'approved':
      return submissions.filter(s => s.status === 'approved');
    case 'rejected':
      return submissions.filter(s => s.status === 'rejected' || s.status === 'changes_requested');
    default:
      return submissions;
    }
  };
  const getValidationSummary = (validation: ValidationResult[]) => {
    const errors = validation.filter(v => v.severity === 'error').length;
    const warnings = validation.filter(v => v.severity === 'warning').length;
    return { errors, warnings };
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {)
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const formatPrice = (cents: number) => {
    return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;}
  };
  if (isLoading) {
    return ()
      <div className="submission-manager loading">
        <div className="loading-spinner">Loading submissions...</div>
      </div>
    );
  }
  if (error) {
    return ()
      <div className="submission-manager error">
        <div className="error-message">
          <h3>Error loading submissions</h3>
          <p>{error}</p>
          <button onClick={fetchSubmissions}>Try Again</button>
        </div>
      </div>
    );
  }
  const filteredSubmissions = getFilteredSubmissions();
  return ()
    <div className="submission-manager">
      <div className="manager-header">
        <h2>My Template Submissions</h2>
        <Link to="/marketplace/submit" className="btn-primary">
          Submit New Template
        </Link>
      </div>
      {stats && ()
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total_submissions}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.approved_submissions}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pending_submissions}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.avg_review_score > 0 ? Math.round(stats.avg_review_score) : 'N/A'}
            </div>
            <div className="stat-label">Avg Review Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.avg_review_time_hours > 0 ? `${Math.round(stats.avg_review_time_hours)}h` : 'N/A'}
            </div>
            <div className="stat-label">Avg Review Time</div>
          </div>
        </div>
      )}
      <div className="filter-tabs">
        <button
          className={selectedTab === 'all' ? 'active' : ''}
          onClick={() => setSelectedTab('all')}
        >
          All ({submissions.length})
        </button>
        <button
          className={selectedTab === 'drafts' ? 'active' : ''}
          onClick={() => setSelectedTab('drafts')}
        >
          Drafts ({submissions.filter(s => s.status === 'draft').length})
        </button>
        <button
          className={selectedTab === 'submitted' ? 'active' : ''}
          onClick={() => setSelectedTab('submitted')}
        >
          Submitted ({submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length})
        </button>
        <button
          className={selectedTab === 'approved' ? 'active' : ''}
          onClick={() => setSelectedTab('approved')}
        >
          Approved ({submissions.filter(s => s.status === 'approved').length})
        </button>
        <button
          className={selectedTab === 'rejected' ? 'active' : ''}
          onClick={() => setSelectedTab('rejected')}
        >
          Rejected ({submissions.filter(s => s.status === 'rejected' || s.status === 'changes_requested').length})
        </button>
      </div>
      {filteredSubmissions.length === 0 ? ()
        <div className="empty-state">
          <h3>No submissions found</h3>
          <p>
            {selectedTab === 'all' 
              ? 'You haven\'t submitted any templates yet.' 
              : `No ${selectedTab} submissions found.`}
            }
          </p>
          <Link to="/marketplace/submit" className="btn-primary">
            Submit Your First Template
          </Link>
        </div>
      ) : ()
        <div className="submissions-list">
          {filteredSubmissions.map(submission => {)
            const validation = getValidationSummary(submission.validation_results);
            return ()
              <div key={submission.id} className="submission-card">
                <div className="submission-header">
                  <div className="submission-info">
                    <h3 className="submission-title">
                      {submission.submission_data.title}
                    </h3>
                    <p className="submission-description">
                      {submission.submission_data.description.substring(0, 100)}
                      {submission.submission_data.description.length > 100 && '...'}
                    </p>
                  </div>
                  <div className="submission-meta">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: STATUS_COLORS[submission.status] }}
                    >
                      {STATUS_LABELS[submission.status]}
                    </span>
                    <span className="version-badge">
                      v{submission.version_number}
                    </span>
                  </div>
                </div>
                <div className="submission-details">
                  <div className="detail-item">
                    <span className="label">Price:</span>
                    <span className="value">{formatPrice(submission.submission_data.price_cents)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(submission.created_at)}</span>
                  </div>
                  {submission.submitted_at && ()
                    <div className="detail-item">
                      <span className="label">Submitted:</span>
                      <span className="value">{formatDate(submission.submitted_at)}</span>
                    </div>
                  )}
                  {submission.reviewed_at && ()
                    <div className="detail-item">
                      <span className="label">Reviewed:</span>
                      <span className="value">{formatDate(submission.reviewed_at)}</span>
                    </div>
                  )}
                </div>
                {submission.validation_results.length > 0 && ()
                  <div className="validation-summary">
                    {validation.errors > 0 && ()
                      <span className="validation-count errors">
                        {validation.errors} error{validation.errors !== 1 ? 's' : ''}
                      </span>
                    )}
                    {validation.warnings > 0 && ()
                      <span className="validation-count warnings">
                        {validation.warnings} warning{validation.warnings !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
                {submission.review_comments && ()
                  <div className="review-feedback">
                    <h4>Review Feedback</h4>
                    <p>{submission.review_comments}</p>
                    {submission.review_score && ()
                      <div className="review-score">
                        Score: {submission.review_score}/100
                      </div>
                    )}
                  </div>
                )}
                <div className="submission-actions">
                  <Link 
                    to={`/marketplace/submissions/${submission.id}/edit`}
                    className="btn-outline"
                  >
                    Edit
                  </Link>
                  {submission.status === 'draft' && ()
                    <button 
                      onClick={() => handleResubmit(submission.id)}
                      className="btn-primary"
                      disabled={validation.errors > 0}
                    >
                      Submit for Review
                    </button>
                  )}
                  {submission.status === 'changes_requested' && ()
                    <button 
                      onClick={() => handleResubmit(submission.id)}
                      className="btn-primary"
                      disabled={validation.errors > 0}
                    >
                      Resubmit
                    </button>
                  )}
                  {submission.status === 'draft' && ()
                    <button 
                      onClick={() => handleDeleteSubmission(submission.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  )}
                  {submission.status === 'approved' && ()
                    <Link 
                      to={`/marketplace/templates/${submission.template_id}`}
                      className="btn-success"
                    >
                      View Live
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubmissionManager;