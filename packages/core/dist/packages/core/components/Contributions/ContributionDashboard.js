import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Contribution Dashboard Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 *
 * Main dashboard for managing all types of contributions including
 * templates, knowledge articles, tutorials, case studies, and community content.
 */
import { useState, useEffect, useCallback } from 'react';
import { ContributionCard } from './ContributionCard';
import { ContributionSubmissionForm } from './ContributionSubmissionForm';
import { ContributorProfileManager } from './ContributorProfileManager';
export const ContributionDashboard = ({ userId, showCreateForm = true, initialFilter = {}, onContributionClick, onContributionEdit, onContributionDelete, className = '' }) => {
    const [contributions, setContributions] = useState([]);
    const [contributorProfile, setContributorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(initialFilter);
    const [activeTab, setActiveTab] = useState('my-contributions');
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
            }
            // Add status filter based on active tab
            if (activeTab === 'drafts') {
                params.append('status', 'draft');
            }
            else if (activeTab === 'published') {
                params.append('status', 'published');
            }
            else if (activeTab === 'under-review') {
                params.append('status', 'under_review');
            }
            // Add other filters
            if (filter.type) {
                params.append('type', filter.type);
            }
            if (filter.search || searchQuery) {
                params.append('search', filter.search || searchQuery);
            }
            // Add sorting
            params.append('sortBy', filter.sortBy || 'created_at');
            params.append('sortOrder', filter.sortOrder || 'desc');
            params.append('limit', (filter.limit || 20).toString());
            const response = await fetch(`/api/marketplace/contributions?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to load contributions: ${response.statusText}`);
            }
            const data = await response.json();
            setContributions(data.contributions || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load contributions');
            setContributions([]);
        }
        finally {
            setLoading(false);
        }
    }, [userId, activeTab, filter, searchQuery]);
    const loadContributorProfile = useCallback(async () => {
        if (!userId)
            return;
        try {
            const response = await fetch(`/api/marketplace/contributors/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const profile = await response.json();
                setContributorProfile(profile);
            }
        }
        catch (err) {
            console.error('Failed to load contributor profile:', err);
        }
    }, [userId]);
    useEffect(() => {
        loadContributions();
        loadContributorProfile();
    }, [loadContributions, loadContributorProfile]);
    // Handle contribution submission
    const handleContributionSubmit = async (data) => {
        try {
            const response = await fetch('/api/marketplace/contributions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Failed to create contribution');
            }
            const newContribution = await response.json();
            setContributions([newContribution, ...contributions]);
            setShowSubmissionForm(false);
            setActiveTab('my-contributions');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create contribution');
        }
    };
    // Handle contribution deletion
    const handleDelete = async (contributionId) => {
        if (!confirm('Are you sure you want to delete this contribution?')) {
            return;
        }
        try {
            const response = await fetch(`/api/marketplace/contributions/${contributionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                setContributions(contributions.filter(c => c.id !== contributionId));
                onContributionDelete?.(contributionId);
            }
        }
        catch (err) {
            console.error('Failed to delete contribution:', err);
        }
    };
    // Filter contributions by tab
    const getFilteredContributions = () => {
        switch (activeTab) {
            case 'drafts':
                return contributions.filter(c => c.status === 'draft');
            case 'published':
                return contributions.filter(c => c.status === 'published');
            case 'under-review':
                return contributions.filter(c => ['submitted', 'under_review', 'revision_requested'].includes(c.status));
            default:
                return contributions;
        }
    };
    const filteredContributions = getFilteredContributions();
    // Get stats for dashboard
    const stats = {
        total: contributions.length,
        drafts: contributions.filter(c => c.status === 'draft').length,
        published: contributions.filter(c => c.status === 'published').length,
        underReview: contributions.filter(c => ['submitted', 'under_review', 'revision_requested'].includes(c.status)).length,
        totalViews: contributions.reduce((sum, c) => sum + c.views, 0),
        totalLikes: contributions.reduce((sum, c) => sum + c.likes, 0),
        avgQualityScore: contributions.length > 0
            ? Math.round(contributions.reduce((sum, c) => sum + c.qualityScore, 0) / contributions.length)
            : 0
    };
    return (_jsxs("div", { className: `contribution-dashboard ${className}`, children: [_jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "header-main", children: [_jsx("h1", { children: "Contribution Dashboard" }), _jsx("p", { children: "Manage your templates, articles, tutorials, and community content" })] }), showCreateForm && (_jsx("button", { onClick: () => setShowSubmissionForm(true), className: "btn-primary create-btn", children: "+ Create New Contribution" }))] }), contributorProfile && (_jsxs("div", { className: "stats-overview", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: stats.total }), _jsx("div", { className: "stat-label", children: "Total Contributions" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: stats.published }), _jsx("div", { className: "stat-label", children: "Published" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: stats.drafts }), _jsx("div", { className: "stat-label", children: "Drafts" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: stats.underReview }), _jsx("div", { className: "stat-label", children: "Under Review" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: stats.totalViews.toLocaleString() }), _jsx("div", { className: "stat-label", children: "Total Views" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: stats.totalLikes }), _jsx("div", { className: "stat-label", children: "Total Likes" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: contributorProfile.level }), _jsx("div", { className: "stat-label", children: "Contributor Level" })] }), _jsxs("div", { className: "stat-card", children: [_jsxs("div", { className: "stat-value", children: [stats.avgQualityScore, "%"] }), _jsx("div", { className: "stat-label", children: "Avg Quality Score" })] })] })), _jsxs("div", { className: "dashboard-tabs", children: [_jsxs("button", { onClick: () => setActiveTab('my-contributions'), className: `tab-btn ${activeTab === 'my-contributions' ? 'active' : ''}`, children: ["All Contributions (", stats.total, ")"] }), _jsxs("button", { onClick: () => setActiveTab('drafts'), className: `tab-btn ${activeTab === 'drafts' ? 'active' : ''}`, children: ["Drafts (", stats.drafts, ")"] }), _jsxs("button", { onClick: () => setActiveTab('published'), className: `tab-btn ${activeTab === 'published' ? 'active' : ''}`, children: ["Published (", stats.published, ")"] }), _jsxs("button", { onClick: () => setActiveTab('under-review'), className: `tab-btn ${activeTab === 'under-review' ? 'active' : ''}`, children: ["Under Review (", stats.underReview, ")"] }), contributorProfile && (_jsx("button", { onClick: () => setActiveTab('profile'), className: `tab-btn ${activeTab === 'profile' ? 'active' : ''}`, children: "Profile" }))] }), activeTab !== 'profile' && activeTab !== 'create' && (_jsxs("div", { className: "dashboard-controls", children: [_jsxs("div", { className: "search-input", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", className: "search-icon", children: [_jsx("circle", { cx: "8", cy: "8", r: "3.5", stroke: "currentColor", strokeWidth: "1.5", fill: "none" }), _jsx("path", { d: "11.5 11.5L15 15", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })] }), _jsx("input", { type: "text", placeholder: "Search contributions...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs("select", { value: filter.type || '', onChange: (e) => setFilter(prev => ({
                            ...prev,
                            type: e.target.value ? e.target.value : undefined
                        })), className: "filter-select", children: [_jsx("option", { value: "", children: "All Types" }), _jsx("option", { value: "template", children: "Templates" }), _jsx("option", { value: "knowledge_article", children: "Knowledge Articles" }), _jsx("option", { value: "tutorial", children: "Tutorials" }), _jsx("option", { value: "case_study", children: "Case Studies" }), _jsx("option", { value: "pattern_library", children: "Pattern Libraries" }), _jsx("option", { value: "community_post", children: "Community Posts" })] }), _jsxs("select", { value: filter.sortBy || 'created_at', onChange: (e) => setFilter(prev => ({
                            ...prev,
                            sortBy: e.target.value
                        })), className: "sort-select", children: [_jsx("option", { value: "created_at", children: "Latest First" }), _jsx("option", { value: "updated_at", children: "Recently Updated" }), _jsx("option", { value: "views", children: "Most Viewed" }), _jsx("option", { value: "likes", children: "Most Liked" }), _jsx("option", { value: "quality_score", children: "Highest Quality" })] })] })), _jsx("div", { className: "dashboard-content", children: activeTab === 'profile' && contributorProfile ? (_jsx(ContributorProfileManager, { profile: contributorProfile, onProfileUpdate: (updatedProfile) => setContributorProfile(updatedProfile) })) : loading ? (_jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading contributions..." })] })) : error ? (_jsxs("div", { className: "error-state", children: [_jsx("h3", { children: "Failed to load contributions" }), _jsx("p", { children: error }), _jsx("button", { onClick: loadContributions, className: "retry-button", children: "Try again" })] })) : filteredContributions.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("h3", { children: "No contributions found" }), _jsx("p", { children: activeTab === 'my-contributions'
                                ? 'You haven\'t created any contributions yet.'
                                : `No ${activeTab.replace('-', ' ')} found.` }), showCreateForm && (_jsx("button", { onClick: () => setShowSubmissionForm(true), className: "btn-primary", children: "Create Your First Contribution" }))] })) : (_jsx("div", { className: "contributions-grid", children: filteredContributions.map((contribution) => (_jsx(ContributionCard, { contribution: contribution, onEdit: () => onContributionEdit?.(contribution.id), onDelete: () => handleDelete(contribution.id), onClick: () => onContributionClick?.(contribution), showActions: true }, contribution.id))) })) }), showSubmissionForm && (_jsx("div", { className: "modal-overlay", onClick: () => setShowSubmissionForm(false), children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: "Create New Contribution" }), _jsx("button", { onClick: () => setShowSubmissionForm(false), className: "modal-close", children: "\u00D7" })] }), _jsx(ContributionSubmissionForm, { onSubmit: handleContributionSubmit, onCancel: () => setShowSubmissionForm(false) })] }) })), _jsx("style", { children: `
        .contribution-dashboard {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .header-main h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
        }

        .header-main p {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }

        .create-btn {
          background: #3b82f6;
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .create-btn:hover {
          background: #2563eb;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .dashboard-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
          overflow-x: auto;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          font-weight: 500;
          color: #6b7280;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: #3b82f6;
        }

        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .dashboard-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-input {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .filter-select, .sort-select {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
          font-size: 14px;
          cursor: pointer;
          min-width: 150px;
        }

        .dashboard-content {
          min-height: 400px;
        }

        .contributions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .loading-state, .error-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-state h3, .empty-state h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
        }

        .error-state p, .empty-state p {
          margin: 0 0 16px 0;
          color: #6b7280;
        }

        .retry-button {
          background: #3b82f6;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .retry-button:hover {
          background: #2563eb;
        }

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
        }

        .modal-content {
          background: #ffffff;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          margin: -4px;
        }

        .modal-close:hover {
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .contribution-dashboard {
            padding: 16px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .dashboard-controls {
            flex-direction: column;
          }

          .search-input {
            min-width: auto;
          }

          .contributions-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .modal-content {
            margin: 0;
            border-radius: 0;
            height: 100vh;
            max-height: none;
          }
        }
      ` })] }));
};
export default ContributionDashboard;
