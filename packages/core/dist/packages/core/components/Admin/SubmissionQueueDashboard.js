import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Submission Queue Dashboard - E17-1753114397296-8AA0B5
 *
 * Administrative interface for managing the marketplace submission review queue
 * Part of Epic 17.5.1 - Review Workflow (Backstage Admin Controls)
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Queue, Clock, User, FileText, Eye, CheckCircle, AlertTriangle, Search, RefreshCw, Download, Calendar, BarChart3, TrendingUp, Users } from 'lucide-react';
const SubmissionQueueDashboard = () => {
    // State management
    const [submissions, setSubmissions] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [filters, setFilters] = useState({
        sort_by: 'submitted_at',
        sort_order: 'desc',
        page: 1,
        limit: 50
    });
    const [loading, setLoading] = useState(true);
    const [selectedSubmissions, setSelectedSubmissions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    // Load queue data
    useEffect(() => {
        loadSubmissionQueue();
        loadQueueMetrics();
        const interval = setInterval(loadQueueMetrics, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [filters]);
    const loadSubmissionQueue = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)),
                ...(searchQuery && { search: searchQuery })
            });
            const response = await fetch(`/api/submissions/review-queue?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
            }
        }
        catch (error) {
            console.error('Failed to load submission queue:', error);
        }
        setLoading(false);
    };
    const loadQueueMetrics = async () => {
        try {
            const response = await fetch('/api/submissions/queue-metrics', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
            }
        }
        catch (error) {
            console.error('Failed to load queue metrics:', error);
        }
    };
    const handleAssignReviewer = async (submissionId, reviewerId) => {
        try {
            const response = await fetch(`/api/submissions/${submissionId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ reviewer_id: reviewerId })
            });
            if (response.ok) {
                loadSubmissionQueue();
            }
        }
        catch (error) {
            console.error('Failed to assign reviewer:', error);
        }
    };
    const handleBulkAssign = async (reviewerId) => {
        try {
            const response = await fetch('/api/submissions/bulk-assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    submission_ids: selectedSubmissions,
                    reviewer_id: reviewerId
                })
            });
            if (response.ok) {
                setSelectedSubmissions([]);
                loadSubmissionQueue();
            }
        }
        catch (error) {
            console.error('Failed to bulk assign submissions:', error);
        }
    };
    const handleUpdatePriority = async (submissionId, priority) => {
        try {
            const response = await fetch(`/api/submissions/${submissionId}/priority`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ priority })
            });
            if (response.ok) {
                loadSubmissionQueue();
            }
        }
        catch (error) {
            console.error('Failed to update priority:', error);
        }
    };
    const getPriorityColor = (priority) => {
        const colors = {
            urgent: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-gray-100 text-gray-800'
        };
        return colors[priority] || colors.medium;
    };
    const getStatusColor = (status) => {
        const colors = {
            submitted: 'bg-blue-100 text-blue-800',
            under_review: 'bg-purple-100 text-purple-800',
            changes_requested: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.submitted;
    };
    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0)
            return `${days}d ago`;
        if (hours > 0)
            return `${hours}h ago`;
        return 'Just now';
    };
    return (_jsxs("div", { className: "submission-queue-dashboard", children: [_jsxs("div", { className: "queue-header", children: [_jsxs("div", { className: "header-content", children: [_jsxs("div", { className: "title-section", children: [_jsx(Queue, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Submission Queue" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage and review marketplace template submissions" })] })] }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { onClick: loadSubmissionQueue, disabled: loading, variant: "outline", children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh"] }), _jsxs(Button, { onClick: () => { }, variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export"] })] })] }), metrics && (_jsxs("div", { className: "metrics-grid", children: [_jsx(Card, { className: "metric-card", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Pending Review" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: metrics.total_pending })] }), _jsx(Queue, { className: "w-8 h-8 text-blue-500" })] }) }) }), _jsx(Card, { className: "metric-card", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Under Review" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: metrics.total_under_review })] }), _jsx(Eye, { className: "w-8 h-8 text-purple-500" })] }) }) }), _jsx(Card, { className: "metric-card", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Avg Wait Time" }), _jsxs("p", { className: "text-2xl font-bold text-orange-600", children: [metrics.average_wait_time_hours.toFixed(1), "h"] })] }), _jsx(Clock, { className: "w-8 h-8 text-orange-500" })] }) }) }), _jsx(Card, { className: "metric-card", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Today's Reviews" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: metrics.reviews_completed_today })] }), _jsx(CheckCircle, { className: "w-8 h-8 text-green-500" })] }) }) })] }))] }), _jsxs(Tabs, { defaultValue: "queue", className: "queue-tabs", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "queue", children: "Review Queue" }), _jsx(TabsTrigger, { value: "reviewers", children: "Reviewer Workload" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsxs(TabsContent, { value: "queue", className: "queue-content", children: [_jsx(Card, { className: "filter-card", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "filter-section", children: [_jsxs("div", { className: "search-bar", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search submissions by title, submitter, or template ID...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "flex-1 outline-none border-0 bg-transparent" })] }), _jsxs("div", { className: "filter-controls", children: [_jsxs("select", { value: filters.status?.join(',') || '', onChange: (e) => setFilters({ ...filters, status: e.target.value ? e.target.value.split(',') : undefined }), className: "filter-select", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "submitted", children: "Submitted" }), _jsx("option", { value: "under_review", children: "Under Review" }), _jsx("option", { value: "changes_requested", children: "Changes Requested" })] }), _jsxs("select", { value: filters.priority?.join(',') || '', onChange: (e) => setFilters({ ...filters, priority: e.target.value ? e.target.value.split(',') : undefined }), className: "filter-select", children: [_jsx("option", { value: "", children: "All Priority" }), _jsx("option", { value: "urgent", children: "Urgent" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "low", children: "Low" })] }), _jsxs("select", { value: `${filters.sort_by}_${filters.sort_order}`, onChange: (e) => {
                                                            const [sort_by, sort_order] = e.target.value.split('_');
                                                            setFilters({ ...filters, sort_by, sort_order });
                                                        }, className: "filter-select", children: [_jsx("option", { value: "submitted_at_desc", children: "Newest First" }), _jsx("option", { value: "submitted_at_asc", children: "Oldest First" }), _jsx("option", { value: "priority_desc", children: "Priority High-Low" }), _jsx("option", { value: "priority_asc", children: "Priority Low-High" }), _jsx("option", { value: "complexity_desc", children: "Complex First" }), _jsx("option", { value: "estimated_time_desc", children: "Longest Review Time" })] })] }), selectedSubmissions.length > 0 && (_jsxs("div", { className: "bulk-actions", children: [_jsxs(Badge, { variant: "outline", className: "mr-2", children: [selectedSubmissions.length, " selected"] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => setSelectedSubmissions([]), children: "Clear Selection" }), _jsxs("select", { onChange: (e) => e.target.value && handleBulkAssign(e.target.value), className: "filter-select ml-2", defaultValue: "", children: [_jsx("option", { value: "", children: "Bulk Assign to Reviewer" }), metrics?.reviewer_workload.map(reviewer => (_jsxs("option", { value: reviewer.reviewer_id, children: [reviewer.reviewer_name, " (", reviewer.active_reviews, " active)"] }, reviewer.reviewer_id)))] })] }))] }) }) }), _jsx(Card, { className: "submissions-table", children: _jsx(CardContent, { className: "p-0", children: loading ? (_jsxs("div", { className: "loading-state", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-gray-400" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Loading submissions..." })] })) : submissions.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx(Queue, { className: "w-12 h-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-700", children: "No submissions in queue" }), _jsx("p", { className: "text-gray-500", children: "All caught up! No submissions match your current filters." })] })) : (_jsx("div", { className: "submissions-list", children: submissions.map((submission) => (_jsxs("div", { className: "submission-row", children: [_jsx("div", { className: "row-checkbox", children: _jsx("input", { type: "checkbox", checked: selectedSubmissions.includes(submission.id), onChange: (e) => {
                                                            if (e.target.checked) {
                                                                setSelectedSubmissions([...selectedSubmissions, submission.id]);
                                                            }
                                                            else {
                                                                setSelectedSubmissions(selectedSubmissions.filter(id => id !== submission.id));
                                                            }
                                                        }, className: "checkbox" }) }), _jsxs("div", { className: "submission-info", children: [_jsxs("div", { className: "submission-header", children: [_jsx("h4", { className: "submission-title", children: submission.submission_data.title }), _jsxs("div", { className: "submission-badges", children: [_jsx(Badge, { className: getPriorityColor(submission.review_priority), children: submission.review_priority }), _jsx(Badge, { className: getStatusColor(submission.status), children: submission.status.replace('_', ' ') })] })] }), _jsxs("div", { className: "submission-details", children: [_jsxs("div", { className: "detail-item", children: [_jsx(User, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { children: submission.submitter_name })] }), _jsxs("div", { className: "detail-item", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { children: formatTimeAgo(submission.submitted_at) })] }), _jsxs("div", { className: "detail-item", children: [_jsx(FileText, { className: "w-4 h-4 text-gray-400" }), _jsxs("span", { children: ["v", submission.version_number] })] }), submission.complexity_score && (_jsxs("div", { className: "detail-item", children: [_jsx(BarChart3, { className: "w-4 h-4 text-gray-400" }), _jsxs("span", { children: ["Complexity: ", submission.complexity_score, "/10"] })] })), submission.estimated_review_time && (_jsxs("div", { className: "detail-item", children: [_jsx(Clock, { className: "w-4 h-4 text-gray-400" }), _jsxs("span", { children: ["Est. ", submission.estimated_review_time, "m"] })] }))] }), submission.validation_results.some(r => r.severity === 'error') && (_jsxs("div", { className: "validation-warnings", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-red-500" }), _jsxs("span", { className: "text-red-600", children: [submission.validation_results.filter(r => r.severity === 'error').length, " validation errors"] })] }))] }), _jsxs("div", { className: "submission-actions", children: [_jsxs("select", { value: submission.review_priority, onChange: (e) => handleUpdatePriority(submission.id, e.target.value), className: "priority-select", children: [_jsx("option", { value: "low", children: "Low Priority" }), _jsx("option", { value: "medium", children: "Medium Priority" }), _jsx("option", { value: "high", children: "High Priority" }), _jsx("option", { value: "urgent", children: "Urgent" })] }), _jsxs("select", { value: submission.assigned_reviewer || '', onChange: (e) => e.target.value && handleAssignReviewer(submission.id, e.target.value), className: "reviewer-select", disabled: submission.status === 'approved' || submission.status === 'rejected', children: [_jsx("option", { value: "", children: "Assign Reviewer" }), metrics?.reviewer_workload.map(reviewer => (_jsxs("option", { value: reviewer.reviewer_id, children: [reviewer.reviewer_name, " (", reviewer.active_reviews, " active)"] }, reviewer.reviewer_id)))] }), _jsxs(Button, { size: "sm", onClick: () => window.open(`/admin/submissions/${submission.id}`, '_blank'), children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "Review"] })] })] }, submission.id))) })) }) })] }), _jsx(TabsContent, { value: "reviewers", className: "reviewers-content", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Users, { className: "w-5 h-5 mr-2" }), "Reviewer Workload"] }) }), _jsx(CardContent, { children: metrics?.reviewer_workload.map(reviewer => (_jsxs("div", { className: "reviewer-card", children: [_jsxs("div", { className: "reviewer-info", children: [_jsx("h4", { className: "reviewer-name", children: reviewer.reviewer_name }), _jsxs("div", { className: "reviewer-stats", children: [_jsxs("span", { children: [reviewer.active_reviews, " active reviews"] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [reviewer.completed_today, " completed today"] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Avg: ", reviewer.average_review_time.toFixed(1), "h"] })] })] }), _jsx("div", { className: "workload-bar", children: _jsx("div", { className: "workload-fill", style: { width: `${Math.min(reviewer.active_reviews * 10, 100)}%` } }) })] }, reviewer.reviewer_id))) })] }) }), _jsx(TabsContent, { value: "analytics", className: "analytics-content", children: _jsx("div", { className: "analytics-grid", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "w-5 h-5 mr-2" }), "Queue Trends"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "trend-metrics", children: [_jsxs("div", { className: "trend-item", children: [_jsx("span", { className: "trend-label", children: "Queue Velocity" }), _jsxs("span", { className: "trend-value", children: [metrics?.queue_velocity.toFixed(1), " sub/day"] })] }), _jsxs("div", { className: "trend-item", children: [_jsx("span", { className: "trend-label", children: "Avg Review Time" }), _jsxs("span", { className: "trend-value", children: [metrics?.average_review_time_hours.toFixed(1), "h"] })] })] }) })] }) }) })] }), _jsx("style", { children: `
        .submission-queue-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .queue-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .metric-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .queue-tabs {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .filter-card {
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .filter-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          min-width: 150px;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px;
          background: #f1f5f9;
          border-radius: 8px;
        }

        .submissions-table {
          border: 1px solid #e2e8f0;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px;
          text-align: center;
        }

        .submissions-list {
          divide-y: 1px solid #e2e8f0;
        }

        .submission-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          transition: background-color 0.2s;
        }

        .submission-row:hover {
          background: #f8fafc;
        }

        .row-checkbox {
          flex-shrink: 0;
        }

        .checkbox {
          width: 16px;
          height: 16px;
          accent-color: #3b82f6;
        }

        .submission-info {
          flex: 1;
          min-width: 0;
        }

        .submission-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .submission-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
        }

        .submission-badges {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .submission-details {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #6b7280;
        }

        .validation-warnings {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }

        .submission-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }

        .priority-select, .reviewer-select {
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: white;
          font-size: 14px;
          min-width: 120px;
        }

        .reviewer-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .reviewer-info {
          flex: 1;
        }

        .reviewer-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .reviewer-stats {
          font-size: 14px;
          color: #6b7280;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .workload-bar {
          width: 100px;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .workload-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
          transition: width 0.3s;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .trend-metrics {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .trend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .trend-label {
          font-size: 14px;
          color: #6b7280;
        }

        .trend-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .submission-queue-dashboard {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .filter-controls {
            flex-direction: column;
          }

          .filter-select {
            min-width: auto;
          }

          .submission-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .submission-header {
            flex-direction: column;
            gap: 8px;
          }

          .submission-badges {
            flex-wrap: wrap;
          }

          .submission-actions {
            justify-content: stretch;
          }

          .priority-select, .reviewer-select {
            flex: 1;
            min-width: auto;
          }
        }
      ` })] }));
};
export default SubmissionQueueDashboard;
