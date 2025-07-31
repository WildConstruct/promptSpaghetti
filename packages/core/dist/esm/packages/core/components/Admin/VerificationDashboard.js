import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Admin Verification Dashboard - E17-1753114397393-BA8A32
 *
 * Administrative interface for managing identity verification requests
 * Part of Epic 17.5.5 - Verification System
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { CheckCircle, XCircle, Clock, AlertCircle, Users, FileText, TrendingUp, TrendingDown, Search, Download, Eye, RefreshCw } from 'lucide-react';
{
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    // Mock admin metrics - in real implementation, this would come from an admin service
    const [metrics, setMetrics] = useState({});
    totalRequests: 1247,
        pendingRequests;
    23,
        approvedToday;
    18,
        rejectedToday;
    3,
        averageProcessingTime;
    4.2,
        queueBacklog;
    23,
        priorityRequests;
    8,
    ;
}
;
// Mock queue data - in real implementation, this would come from admin service
const [verificationQueue, setVerificationQueue] = useState([]);
{
    userId: 'user-1',
        requestId;
    'val_1738457234_abc123',
        timestamp;
    Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        type;
    'government_id',
        data;
    {
        fullName: 'John Director', governmentId;
        {
            type: 'passport', number;
            'P1234567', expirationDate;
            '2026-12-31', issuingAuthority;
            'US State Dept', documentImages;
            [];
        }
    }
    status: 'pending',
        metadata;
    {
        ipAddress: '192.168.1.1', userAgent;
        'Chrome', sessionId;
        'sess123', requestSource;
        'profile_setup';
    }
    priority: 'high',
        timeInQueue;
    2.5,
        complexity;
    'moderate',
        flagged;
    false;
}
{
    userId: 'user-2',
        requestId;
    'val_1738457235_def456',
        timestamp;
    Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
        type;
    'professional_credentials',
        data;
    {
        fullName: 'Sarah Producer', professionalCredentials;
        {
            role: 'producer', experience;
            'professional', credentials;
            [], portfolio;
            [];
        }
    }
    status: 'in_review',
        metadata;
    {
        ipAddress: '192.168.1.2', userAgent;
        'Safari', sessionId;
        'sess456', requestSource;
        'manual_request';
    }
    priority: 'medium',
        timeInQueue;
    6.2,
        assignedReviewer;
    'admin-jane',
        complexity;
    'complex',
        flagged;
    true;
    ;
    const handleRefresh = async () => {
        setIsLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            // In real implementation, refresh data from API
            setIsLoading(false);
        }, 1000);
    };
    const handleStatusUpdate = (requestId, newStatus) => {
        setVerificationQueue(prev => );
        prev.map(item => );
        item.requestId === requestId
            ? { ...item, status: newStatus }
            : item;
    };
    ;
}
;
const getStatusColor = (status) => {
    switch (status) {
        case 'approved': return 'text-green-600 bg-green-100';
        case 'rejected': return 'text-red-600 bg-red-100';
        case 'pending': return 'text-yellow-600 bg-yellow-100';
        case 'in_review': return 'text-blue-600 bg-blue-100';
        case 'requires_update': return 'text-orange-600 bg-orange-100';
        default: return 'text-gray-600 bg-gray-100';
    }
    ;
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
        ;
        const filteredQueue = verificationQueue.filter(item => { });
        const matchesSearch = searchTerm === '' || ;
        item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.data.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    };
    const renderOverview = () => ();
    ;
    _jsxs("div", { className: "overview-section", children: [_jsxs("div", { className: "metrics-grid", children: [_jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Users, { className: "w-5 h-5 text-blue-500" }), _jsx("span", { className: "metric-label", children: "Total Requests" })] }), _jsx("div", { className: "metric-value", children: metrics.totalRequests }), _jsxs("div", { className: "metric-change positive", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+12% this month"] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Clock, { className: "w-5 h-5 text-yellow-500" }), _jsx("span", { className: "metric-label", children: "Pending Queue" })] }), _jsx("div", { className: "metric-value", children: metrics.pendingRequests }), _jsxs("div", { className: "metric-change neutral", children: [_jsx(TrendingDown, { className: "w-4 h-4" }), "-3 since yesterday"] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-500" }), _jsx("span", { className: "metric-label", children: "Approved Today" })] }), _jsx("div", { className: "metric-value", children: metrics.approvedToday }), _jsxs("div", { className: "metric-change positive", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+5 vs yesterday"] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(XCircle, { className: "w-5 h-5 text-red-500" }), _jsx("span", { className: "metric-label", children: "Rejected Today" })] }), _jsx("div", { className: "metric-value", children: metrics.rejectedToday }), _jsx("div", { className: "metric-change neutral", children: "Same as yesterday" })] }) })] }), _jsxs("div", { className: "performance-cards", children: [_jsxs(Card, { className: "performance-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Processing Performance" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "performance-metrics", children: [_jsxs("div", { className: "performance-item", children: [_jsx("span", { children: "Average Processing Time" }), _jsxs("span", { className: "performance-value", children: [metrics.averageProcessingTime, "h"] })] }), _jsxs("div", { className: "performance-item", children: [_jsx("span", { children: "Queue Backlog" }), _jsx("span", { className: "performance-value", children: metrics.queueBacklog })] }), _jsxs("div", { className: "performance-item", children: [_jsx("span", { children: "Priority Requests" }), _jsx("span", { className: "performance-value priority", children: metrics.priorityRequests })] })] }) })] }), _jsxs(Card, { className: "alerts-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "System Alerts" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "alerts-list", children: [_jsxs("div", { className: "alert-item warning", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsx("span", { children: "8 requests approaching SLA deadline" })] }), _jsxs("div", { className: "alert-item info", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { children: "2 flagged requests need senior review" })] }), _jsxs("div", { className: "alert-item success", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), _jsx("span", { children: "Processing efficiency up 15%" })] })] }) })] })] })] });
};
;
const renderQueue = () => ();
;
_jsxs("div", { className: "queue-section", children: [_jsxs("div", { className: "queue-controls", children: [_jsxs("div", { className: "search-bar", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search by user ID, request ID, or name...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input" })] }), _jsxs("div", { className: "filters", children: [_jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "filter-select", children: [_jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "in_review", children: "In Review" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" }), _jsx("option", { value: "requires_update", children: "Requires Update" })] }), _jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: "filter-select", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "email_verification", children: "Email" }), _jsx("option", { value: "phone_verification", children: "Phone" }), _jsx("option", { value: "government_id", children: "Government ID" }), _jsx("option", { value: "professional_credentials", children: "Professional" }), _jsx("option", { value: "social_media_verification", children: "Social Media" }), _jsx("option", { value: "portfolio_verification", children: "Portfolio" })] }), _jsxs(Button, { onClick: handleRefresh, disabled: isLoading, variant: "outline", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${isLoading ? 'animate-spin' : ''}` }), "} Refresh"] })] })] }), _jsx("div", { className: "queue-list", children: filteredQueue.map((item) => ()
                < Card, key = { item, : .requestId }, className = "queue-item" >
                _jsxs(CardContent, { children: [_jsxs("div", { className: "queue-item-header", children: [_jsxs("div", { className: "item-info", children: [_jsxs("div", { className: "item-title", children: [_jsx("span", { className: "user-name", children: item.data.fullName || 'Unknown' }), _jsx(Badge, { className: getStatusColor(item.status), children: item.status.replace('_', ' ').toUpperCase() }), _jsx(Badge, { className: getPriorityColor(item.priority), children: item.priority.toUpperCase() }), item.flagged && ()
                                                    < Badge, " className=\"text-red-600 bg-red-100\">", _jsx(AlertCircle, { className: "w-3 h-3 mr-1" }), "FLAGGED"] }), ")}"] }), _jsxs("div", { className: "item-details", children: [_jsxs("span", { children: ["ID: ", item.requestId] }), _jsxs("span", { children: ["Type: ", item.type.replace('_', ' ')] }), _jsxs("span", { children: ["In Queue: ", item.timeInQueue.toFixed(1), "h"] }), _jsxs("span", { children: ["Complexity: ", item.complexity] })] })] }), _jsxs("div", { className: "item-actions", children: [_jsxs(Button, { onClick: () => onRequestSelect?.(item), variant: "outline", size: "sm", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "Review"] }), item.status === 'pending' && ()
                                    < Button, "onClick=", () => handleStatusUpdate(item.requestId, 'in_review'), "size=\"sm\" > Start Review"] }), ")}", item.status === 'in_review' && ()
                            < div, " className=\"review-actions\">", _jsx(Button, { onClick: () => handleStatusUpdate(item.requestId, 'approved'), size: "sm", className: "approve-btn", children: "Approve" }), _jsx(Button, { onClick: () => handleStatusUpdate(item.requestId, 'rejected'), size: "sm", variant: "outline", className: "reject-btn", children: "Reject" })] })) })] });
{
    item.assignedReviewer && ()
        < div;
    className = "assigned-reviewer" >
        _jsxs("span", { children: ["Assigned to: ", item.assignedReviewer] });
    div >
    ;
}
CardContent >
;
Card >
;
div >
    { filteredQueue, : .length === 0 && ()
            < div, className = "empty-state" >
            (_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" })
                ,
                    _jsx("p", { children: "No verification requests match your current filters." })),
        div } >
;
div >
;
;
return;
_jsxs("div", { className: `verification-dashboard ${className}`, children: ["}", _jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Verification Management" }), _jsx("p", { children: "Manage identity verification requests and maintain marketplace trust" })] }), _jsx("div", { className: "header-actions", children: _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Report"] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "dashboard-tabs", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsxs(TabsTrigger, { value: "queue", children: ["Verification Queue", metrics.pendingRequests > 0 && ()
                                    < Badge, " className=\"ml-2 text-xs\">", metrics.pendingRequests] }), ")}"] }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsx(TabsContent, { value: "overview", className: "tab-content", children: renderOverview() }), _jsx(TabsContent, { value: "queue", className: "tab-content", children: renderQueue() }), _jsx(TabsContent, { value: "analytics", className: "tab-content", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Verification Analytics" }) }), _jsx(CardContent, { children: _jsx("p", { children: "Analytics dashboard coming soon..." }) })] }) }), _jsx(TabsContent, { value: "settings", className: "tab-content", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Verification Settings" }) }), _jsx(CardContent, { children: _jsx("p", { children: "Configuration settings coming soon..." }) })] }) })] })
    ,
        _jsx("style", { children: `
        .verification-dashboard {
          max-width: 1400px;
  margin: 0 auto;
          padding: 1.5rem;
  display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
  gap: 1rem;
        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.5rem;
        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        .header-actions {
          display: flex;
  gap: 0.5rem;
        .overview-section {
          display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        .metric-card .card-content {
          padding: 1.5rem;
        .metric-header {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          margin-bottom: 0.75rem;
        .metric-label {
          font-size: 0.875rem;
  color: #6b7280;
          font-weight: 500;
        .metric-value {
          font-size: 2rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.5rem;
        .metric-change {
          display: flex;
          align-items: center;
  gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        .metric-change.positive {
          color: #059669;
        .metric-change.negative {
          color: #dc2626;
        .metric-change.neutral {
          color: #6b7280;
        .performance-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
  gap: 1rem;
        .performance-metrics {
          display: flex;
          flex-direction: column;
  gap: 0.75rem;
        .performance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
  padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        .performance-item:last-child {
          border-bottom: none;
        .performance-value {
          font-weight: 600;
  color: #1f2937;
        .performance-value.priority {
          color: #dc2626;
        .alerts-list {
          display: flex;
          flex-direction: column;
  gap: 0.75rem;
        .alert-item {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
        .alert-item.warning {
          background: #fef3c7;
  color: #92400e;
        .alert-item.info {
          background: #dbeafe;
  color: #1e40af;
        .alert-item.success {
          background: #d1fae5;
  color: #065f46;
        .queue-section {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .queue-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
  gap: 1rem;
          padding: 1rem;
  background: #f9fafb;
          border-radius: 8px;
        .search-bar {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          flex: 1;
          max-width: 400px;
  position: relative;
        .search-bar .lucide {
          position: absolute;
  left: 0.75rem;
          z-index: 1;
        .search-input {
          flex: 1;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .search-input:focus {,
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        .filters {
          display: flex;
          align-items: center;
  gap: 0.5rem;
        .filter-select {
          padding: 0.5rem;
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
  background: white;
        .queue-list {
          display: flex;
          flex-direction: column;
  gap: 0.75rem;
        .queue-item .card-content {
          padding: 1rem;
        .queue-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
  gap: 1rem;
        .item-info {
          flex: 1;
        .item-title {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          margin-bottom: 0.5rem;
        .user-name {
          font-weight: 600;
  color: #1f2937;
        .item-details {
          display: flex;
  gap: 1rem;
          font-size: 0.75rem;
  color: #6b7280;
        .item-actions {
          display: flex;
  gap: 0.5rem;
          align-items: center;
        .review-actions {
          display: flex;
  gap: 0.5rem;
        .approve-btn {
          background: #059669;
          border-color: #059669;
        .approve-btn:hover {,
  background: #047857;
          border-color: #047857;
        .reject-btn {
          color: #dc2626;
          border-color: #dc2626;
        .reject-btn:hover {,
  background: #dc2626;
          color: white;
        .assigned-reviewer {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.875rem;
  color: #6b7280;
        .empty-state {
          text-align: center;
  padding: 4rem;
          color: #6b7280;
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          .queue-controls {
            flex-direction: column;
            align-items: stretch;
  gap: 0.75rem;
          .search-bar {
            max-width: none;
          .filters {
            flex-wrap: wrap;
          .queue-item-header {
            flex-direction: column;
  gap: 0.75rem;
          .performance-cards {
            grid-template-columns: 1fr;
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
      ` });
div >
;
;
;
export default VerificationDashboard;
