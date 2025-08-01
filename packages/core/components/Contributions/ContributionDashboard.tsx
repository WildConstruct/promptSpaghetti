/**
 * Epic 16 Contribution Dashboard Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 * 
 * Main dashboard for managing all types of contributions including
 * templates, knowledge articles, tutorials, case studies, and community content.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Contribution, 
  ContributionType, 
  ContributionStatus,
  ContributionFilter,
  CreateContributionRequest }
  ContributorProfile
 from '../../types/contributions';
import { ContributionCard } from './ContributionCard';
import { ContributionSubmissionForm } from './ContributionSubmissionForm';
import { ContributorProfileManager } from './ContributorProfileManager';


export interface ContributionDashboardProps { userId?: string;
  showCreateForm?: boolean;
  initialFilter?: ContributionFilter;
  onContributionClick?: (contribution: Contribution) => void;
  onContributionEdit?: (contributionId: string) => void;
  onContributionDelete?: (contributionId: string) => void;
  className?: string }

export const ContributionDashboard: React.FC<ContributionDashboardProps> = ({ )
  userId
  showCreateForm = true }
  initialFilter = {}
  onContributionClick
  onContributionEdit
  onContributionDelete
  className = ''
}) => { const [contributions, setContributions] = useState<Contribution>([]);
  const [contributorProfile, setContributorProfile] = useState<ContributorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContributionFilter>(initialFilter);
  const [activeTab, setActiveTab] = useState<'my-contributions' | 'drafts' | 'published' | 'under-review' | 'create' | 'profile'>('my-contributions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  // Load contributions and profile
  const loadContributions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      // Add user filter if provided
      if (userId) {
        params.append('contributorId', userId);
      // Add status filter based on active tab
      if (activeTab === 'drafts') {
        params.append('status', 'draft') } else if (activeTab === 'published') { params.append('status', 'published') } else if (activeTab === 'under-review') {
        params.append('status', 'under_review');
      // Add other filters
      if (filter.type) {
        params.append('type', filter.type);
      if (filter.search || searchQuery) {
        params.append('search', filter.search || searchQuery);
      // Add sorting
      params.append('sortBy', filter.sortBy || 'created_at');
      params.append('sortOrder', filter.sortOrder || 'desc');
      params.append('limit', (filter.limit || 20).toString());
      const response = await fetch(`/api/marketplace/contributions?${params}`, {)}
  },
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
      });
      if (!response.ok) {
        throw new Error(`Failed to load contributions: ${response.statusText}`);}
      const data = await response.json();
      setContributions(data.contributions || []);
 catch (err) { setError(err instanceof Error ? err.message : 'Failed to load contributions');
  setContributions([]) } finally { setLoading(false) }, [userId, activeTab, filter, searchQuery]);
  const loadContributorProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/marketplace/contributors/${userId}`, {)}
  },
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
      });
      if (response.ok) { const profile = await response.json();
        setContributorProfile(profile) } catch (err) { console.error('Failed to load contributor profile:', err) }, [userId]);
  useEffect(() => { loadContributions();
    loadContributorProfile() }, [loadContributions, loadContributorProfile]);
  // Handle contribution submission
  const handleContributionSubmit = async (data: CreateContributionRequest) => { try {
      const response = await fetch('/api/marketplace/contributions', {)
  method: 'POST',
        headers: {
          'Content-Type': 'application/json' }
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
  },
  body: JSON.stringify(data);
  });
      if (!response.ok) { throw new Error('Failed to create contribution');
      const newContribution = await response.json();
      setContributions([newContribution, ...contributions]);
      setShowSubmissionForm(false);
      setActiveTab('my-contributions') } catch (err) { setError(err instanceof Error ? err.message : 'Failed to create contribution') };
  // Handle contribution deletion
  const handleDelete = async (contributionId: string) => {
    if (!confirm('Are you sure you want to delete this contribution?')) {
      return;
    try {
      const response = await fetch(`/api/marketplace/contributions/${contributionId}`, {)}
  },
  method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
      });
      if (response.ok) { setContributions(contributions.filter(c => c.id !== contributionId));
        onContributionDelete?.(contributionId) } catch (err) { console.error('Failed to delete contribution:', err) };
  // Filter contributions by tab
  const getFilteredContributions = () => { switch (activeTab) {
  case 'drafts':,
  return contributions.filter(c => c.status === 'draft');
  case 'published':,
  return contributions.filter(c => c.status === 'published');
  case 'under-review':,
  return contributions.filter(c => ['submitted', 'under_review', 'revision_requested'].includes(c.status));
  default: }
  return contributions;
};
  const filteredContributions = getFilteredContributions();
  // Get stats for dashboard
  const stats = { total: contributions.length,
  drafts: contributions.filter(c => c.status === 'draft').length,
  published: contributions.filter(c => c.status === 'published').length,
  underReview: contributions.filter(),
  c => ['submitted',
  'under_review',
  'revision_requested'].includes(c.status)
  )).length,
  totalViews: contributions.reduce((sum, c) => sum + c.views, 0),
  totalLikes: contributions.reduce((sum, c) => sum + c.likes, 0),
  avgQualityScore: contributions.length > 0 ,
  ? Math.round(contributions.reduce((sum, c) => sum + c.qualityScore, 0) / contributions.length)
  : 0 }
};
  return;
    <div className={`contribution-dashboard ${className}`}>}
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-main">
          <h1>Contribution Dashboard</h1>
          <p>Manage your templates, articles, tutorials, and community content</p>
        </div>
        {showCreateForm && ()
          <button 
            onClick={() => setShowSubmissionForm(true)}
            className="btn-primary create-btn"
          >
            + Create New Contribution
          </button>
        )}
      </div>
      {/* Stats Overview */}
      {contributorProfile && ()
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Contributions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.published}</div>
            <div className="stat-label">Published</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.drafts}</div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.underReview}</div>
            <div className="stat-label">Under Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalViews.toLocaleString()}</div>
            <div className="stat-label">Total Views</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalLikes}</div>
            <div className="stat-label">Total Likes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{contributorProfile.level}</div>
            <div className="stat-label">Contributor Level</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.avgQualityScore}%</div>
            <div className="stat-label">Avg Quality Score</div>
          </div>
        </div>
      )}
      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          onClick={() => setActiveTab('my-contributions')}
          className={`tab-btn ${activeTab === 'my-contributions' ? 'active' : ''}`}
        >
          All Contributions ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={`tab-btn ${activeTab === 'drafts' ? 'active' : ''}`}
        >
          Drafts ({stats.drafts})
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
        >
          Published ({stats.published})
        </button>
        <button
          onClick={() => setActiveTab('under-review')}
          className={`tab-btn ${activeTab === 'under-review' ? 'active' : ''}`}
        >
          Under Review ({stats.underReview})
        </button>
        {contributorProfile && ()
          <button
            onClick={() => setActiveTab('profile')}
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          >
            Profile
          </button>
        )}
      </div>
      {/* Search and Filters */}
      {activeTab !== 'profile' && activeTab !== 'create' && ()
        <div className="dashboard-controls">
          <div className="search-input">
            <svg width="16" height="16" viewBox="0 0 16 16" className="search-icon">
              <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search contributions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filter.type || ''}
            onChange={ (e) => setFilter(prev => ({ )
              ...prev }
              type: e.target.value ? e.target.value as ContributionType : undefined ;
  }))}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="template">Templates</option>
            <option value="knowledge_article">Knowledge Articles</option>
            <option value="tutorial">Tutorials</option>
            <option value="case_study">Case Studies</option>
            <option value="pattern_library">Pattern Libraries</option>
            <option value="community_post">Community Posts</option>
          </select>
          <select
            value={filter.sortBy || 'created_at'}
            onChange={ (e) => setFilter(prev => ({ )
              ...prev }
              sortBy: e.target.value as any ;
  }))}
            className="sort-select"
          >
            <option value="created_at">Latest First</option>
            <option value="updated_at">Recently Updated</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
            <option value="quality_score">Highest Quality</option>
          </select>
        </div>
      )}
      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'profile' && contributorProfile ? ()
          <ContributorProfileManager 
            profile={contributorProfile}
            onProfileUpdate={(updatedProfile) => setContributorProfile(updatedProfile)}
          />
        ) : loading ? ()
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading contributions...</p>
          </div>
        ) : error ? ()
          <div className="error-state">
            <h3>Failed to load contributions</h3>
            <p>{error}</p>
            <button onClick={loadContributions} className="retry-button">
              Try again
            </button>
          </div>
        ) : filteredContributions.length === 0 ? ()
          <div className="empty-state">
            <h3>No contributions found</h3>
            <p>
              {activeTab === 'my-contributions' 
                ? 'You haven\'t created any contributions yet.' 
                : `No ${activeTab.replace('-', ' ')} found.`}
            </p>
            {showCreateForm && ()
              <button 
                onClick={() => setShowSubmissionForm(true)}
                className="btn-primary"
              >
                Create Your First Contribution
              </button>
            )}
          </div>
        ) : ()
          <div className="contributions-grid">
            {filteredContributions.map((contribution) => ()
              <ContributionCard
                key={contribution.id}
                contribution={contribution}
                onEdit={() => onContributionEdit?.(contribution.id)}
                onDelete={() => handleDelete(contribution.id)}
                onClick={() => onContributionClick?.(contribution)}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
      {/* Submission Form Modal */}
      {showSubmissionForm && ()
        <div className="modal-overlay" onClick={() => setShowSubmissionForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Contribution</h2>
              <button 
                onClick={() => setShowSubmissionForm(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <ContributionSubmissionForm
              onSubmit={handleContributionSubmit}
              onCancel={() => setShowSubmissionForm(false)}
            />
          </div>
        </div>
      )}
      <style>{ `
        .contribution-dashboard {
          padding: 24px;
          max-width: 1400px;
  margin: 0 auto;
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        .header-main h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
  color: #1f2937;
        .header-main p {
          margin: 0;
          font-size: 16px;
  color: #6b7280;
        .create-btn {
          background: #3b82f6
  color: #ffffff;
          border: none;
  padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
  cursor: pointer;
          transition: background 0.2s ease;
        .create-btn:hover {
  background: #2563eb;
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        .stat-card {
          background: #ffffff
  border: 1px solid #e5e7eb;
          border-radius: 8px;
  padding: 20px;
          text-align: center;
        .stat-value {
          font-size: 28px;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 4px;
        .stat-label {
          font-size: 14px;
  color: #6b7280;
          font-weight: 500;
        .dashboard-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
          overflow-x: auto;
        .tab-btn {
          background: none;
  border: none;
          padding: 12px 24px
  cursor: pointer;
          font-weight: 500;
  color: #6b7280;
          border-bottom: 3px solid transparent
  transition: all 0.2s ease;
          white-space: nowrap;
        .tab-btn:hover {
  color: #3b82f6;
        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        .dashboard-controls {
          display: flex;
  gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        .search-input {
          position: relative;
  flex: 1;
          min-width: 300px;
        .search-icon {
          position: absolute;
  left: 12px;
          top: 50%
  transform: translateY(-50%);
          color: #9ca3af;
        .search-input input {
          width: 100%
  padding: 10px 12px 10px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        .filter-select, .sort-select {
          padding: 10px 12px
  border: 1px solid #d1d5db;
          border-radius: 6px;
  background: #ffffff;
          font-size: 14px;
  cursor: pointer;
          min-width: 150px;
        .dashboard-content {
          min-height: 400px;
        .contributions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        .loading-state, .error-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
  padding: 80px 20px;
          text-align: center;
        .loading-spinner {
          width: 40px;
  height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50% }
  animation: spin 1s linear infinite;
          margin-bottom: 16px;
        @keyframes spin { 0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        .error-state h3, .empty-state h3 { margin: 0 0 8px 0
  color: #1f2937;
        .error-state p, .empty-state p {
          margin: 0 0 16px 0
  color: #6b7280;
        .retry-button {
          background: #3b82f6
  color: #ffffff;
          border: none;
  padding: 10px 20px;
          border-radius: 6px;
  cursor: pointer;
          transition: background 0.2s ease;
        .retry-button:hover {
  background: #2563eb;
        .modal-overlay {
          position: fixed;
  top: 0;
          left: 0;
  right: 0;
          bottom: 0;
  background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
  padding: 20px;
        .modal-content {
          background: #ffffff;
          border-radius: 12px;
  width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
  position: relative;
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
  padding: 24px 24px 0 24px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
  color: #1f2937;
        .modal-close {
          background: none;
  border: none;
          font-size: 24px;
  cursor: pointer;
          color: #6b7280
  padding: 4px;
          margin: -4px;
        .modal-close:hover { }
  color: #1f2937;
        @media (max-width: 768px) {
          .contribution-dashboard {
            padding: 16px;
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
  gap: 16px;
          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          .dashboard-controls {
            flex-direction: column;
          .search-input {
            min-width: auto;
          .contributions-grid {
            grid-template-columns: 1fr;
  gap: 16px;
          .modal-content {
            margin: 0;
            border-radius: 0;
  height: 100vh;
            max-height: none;
      `}</style>
    </div>
  );
};

export default ContributionDashboard;