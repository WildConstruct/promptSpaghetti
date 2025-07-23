import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Content Scheduling Dashboard - Epic 17
 *
 * Comprehensive content scheduling interface for managing content lifecycle,
 * publication scheduling, promotions, and performance tracking.
 *
 * Task: E17-1753114396947-96EB34 - Design content scheduling
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Calendar, Clock, PlayCircle, PauseCircle, Edit, Eye, TrendingUp, Users, FileText, Image, Video, Megaphone, Archive, Trash2, Plus, Search, Download, RefreshCw, Settings, CheckCircle, XCircle, Globe, Target, Share2, Bell } from 'lucide-react';
import { contentSchedulingService } from '../../services/ContentSchedulingService';
const CONTENT_TYPE_CONFIG = {
    article: { color: 'text-blue-600 bg-blue-100', icon: FileText },
    blog_post: { color: 'text-green-600 bg-green-100', icon: Edit },
    page: { color: 'text-purple-600 bg-purple-100', icon: Globe },
    product: { color: 'text-orange-600 bg-orange-100', icon: Target },
    event: { color: 'text-red-600 bg-red-100', icon: Calendar },
    announcement: { color: 'text-yellow-600 bg-yellow-100', icon: Bell },
    promotion: { color: 'text-pink-600 bg-pink-100', icon: Megaphone },
    newsletter: { color: 'text-indigo-600 bg-indigo-100', icon: Share2 },
    social_post: { color: 'text-cyan-600 bg-cyan-100', icon: Users },
    video: { color: 'text-red-600 bg-red-100', icon: Video },
    podcast: { color: 'text-purple-600 bg-purple-100', icon: PlayCircle },
    gallery: { color: 'text-teal-600 bg-teal-100', icon: Image },
    document: { color: 'text-gray-600 bg-gray-100', icon: FileText }
};
const STATUS_CONFIG = {
    draft: { color: 'text-gray-600 bg-gray-100', icon: Edit },
    scheduled: { color: 'text-blue-600 bg-blue-100', icon: Clock },
    published: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
    unpublished: { color: 'text-yellow-600 bg-yellow-100', icon: PauseCircle },
    archived: { color: 'text-purple-600 bg-purple-100', icon: Archive },
    deleted: { color: 'text-red-600 bg-red-100', icon: Trash2 },
    error: { color: 'text-red-600 bg-red-100', icon: XCircle }
};
export const ContentSchedulingDashboard = ({ className = '', userId, userRole }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [content, setContent] = useState([]);
    const [batches, setBatches] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Filters
    const [_____filter, _____setFilter] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('week');
    // Load data
    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);
    const loadData = async () => {
        try {
            setIsLoading(true);
            // Build filter
            const contentFilter = {
                searchQuery: searchQuery || undefined,
                types: typeFilter !== 'all' ? [typeFilter] : undefined,
                statuses: statusFilter !== 'all' ? [statusFilter] : undefined
            };
            // Add date range filter
            if (dateRange !== 'all') {
                const now = new Date();
                let start;
                switch (dateRange) {
                    case 'today':
                        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                        start = new Date();
                        start.setDate(now.getDate() - 7);
                        break;
                    case 'month':
                        start = new Date();
                        start.setMonth(now.getMonth() - 1);
                        break;
                    default:
                        start = new Date(0);
                }
                contentFilter.dateRange = { start, end: now };
            }
            // Load content
            const contentList = contentSchedulingService.getContent(contentFilter);
            setContent(contentList);
            // Load stats
            const statsData = contentSchedulingService.getSchedulingStats();
            setStats(statsData);
            // Load batches
            const batchList = contentSchedulingService.getBatches();
            setBatches(batchList);
        }
        catch (error) {
            console.error('Failed to load scheduling data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handlePublishContent = async (contentId) => {
        try {
            await contentSchedulingService.publishContent(contentId, userId || 'admin');
            loadData();
        }
        catch (error) {
            console.error('Failed to publish content:', error);
        }
    };
    const handleUnpublishContent = async (contentId) => {
        try {
            await contentSchedulingService.unpublishContent(contentId, userId || 'admin');
            loadData();
        }
        catch (error) {
            console.error('Failed to unpublish content:', error);
        }
    };
    const handleScheduleContent = async (contentId, publishAt) => {
        try {
            await contentSchedulingService.scheduleContent(contentId, {
                publishAt,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }, userId || 'admin');
            loadData();
        }
        catch (error) {
            console.error('Failed to schedule content:', error);
        }
    };
    const filteredContent = useMemo(() => {
        return content.filter(item => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!item.title.toLowerCase().includes(query) &&
                    !item.content.description?.toLowerCase().includes(query) &&
                    !item.metadata.tags?.some(tag => tag.toLowerCase().includes(query))) {
                    return false;
                }
            }
            if (typeFilter !== 'all' && item.type !== typeFilter) {
                return false;
            }
            if (statusFilter !== 'all' && item.status !== statusFilter) {
                return false;
            }
            return true;
        });
    }, [content, searchQuery, typeFilter, statusFilter]);
    const renderOverview = () => {
        if (!stats)
            return _jsx("div", { children: "Loading overview..." });
        return (_jsxs("div", { className: "overview-section", children: [_jsxs("div", { className: "metrics-grid", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "metric-item", children: [_jsx(FileText, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Total Content" }), _jsx("div", { className: "metric-value", children: stats.totalContent }), _jsx("div", { className: "metric-change", children: "All content items" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "metric-item", children: [_jsx(Clock, { className: "w-8 h-8 text-orange-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Scheduled" }), _jsx("div", { className: "metric-value", children: stats.scheduledContent }), _jsx("div", { className: "metric-change", children: "Awaiting publication" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "metric-item", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Published Today" }), _jsx("div", { className: "metric-value", children: stats.publishedToday }), _jsx("div", { className: "metric-change positive", children: "Successfully published" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "metric-item", children: [_jsx(TrendingUp, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Avg Views" }), _jsx("div", { className: "metric-value", children: stats.performanceMetrics.averageViewsPerPost.toFixed(0) }), _jsx("div", { className: "metric-change", children: "Per published post" })] })] }) }) })] }), _jsx("div", { className: "upcoming-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Upcoming Schedules" }) }), _jsx(CardContent, { children: _jsx("div", { className: "upcoming-schedules", children: stats.upcomingSchedules.slice(0, 5).map((schedule, index) => (_jsxs("div", { className: "schedule-item", children: [_jsxs("div", { className: "schedule-date", children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsx("span", { children: schedule.date.toLocaleDateString() })] }), _jsx("div", { className: "schedule-count", children: _jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [schedule.count, " items"] }) }), _jsxs("div", { className: "schedule-preview", children: [schedule.items.slice(0, 3).map(item => (_jsxs("div", { className: "preview-item", children: [_jsx("span", { className: "item-title", children: item.title }), _jsx(Badge, { className: CONTENT_TYPE_CONFIG[item.type].color, size: "sm", children: item.type })] }, item.id))), schedule.items.length > 3 && (_jsxs("div", { className: "preview-more", children: ["+", schedule.items.length - 3, " more"] }))] })] }, index))) }) })] }) }), _jsx("div", { className: "performance-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Top Performing Content" }) }), _jsx(CardContent, { children: _jsx("div", { className: "performance-list", children: stats.performanceMetrics.topPerformingContent.map(item => (_jsxs("div", { className: "performance-item", children: [_jsxs("div", { className: "item-info", children: [_jsx("div", { className: "item-title", children: item.title }), _jsxs("div", { className: "item-stats", children: [_jsxs("span", { children: [item.views.toLocaleString(), " views"] }), _jsxs("span", { children: [item.engagement.toFixed(1), "% engagement"] })] })] }), _jsx("div", { className: "item-chart", children: _jsx("div", { className: "performance-bar", style: {
                                                        width: `${Math.min(100, (item.views / Math.max(...stats.performanceMetrics.topPerformingContent.map(c => c.views))) * 100)}%`
                                                    } }) })] }, item.id))) }) })] }) })] }));
    };
    const renderContentList = () => (_jsxs("div", { className: "content-section", children: [_jsxs("div", { className: "content-controls", children: [_jsxs("div", { className: "search-filters", children: [_jsxs("div", { className: "search-bar", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx(Input, { placeholder: "Search content...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "search-input" })] }), _jsxs(Select, { value: typeFilter, onValueChange: (value) => setTypeFilter(value), children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "article", children: "Article" }), _jsx("option", { value: "blog_post", children: "Blog Post" }), _jsx("option", { value: "page", children: "Page" }), _jsx("option", { value: "product", children: "Product" }), _jsx("option", { value: "event", children: "Event" }), _jsx("option", { value: "announcement", children: "Announcement" }), _jsx("option", { value: "promotion", children: "Promotion" }), _jsx("option", { value: "newsletter", children: "Newsletter" }), _jsx("option", { value: "social_post", children: "Social Post" }), _jsx("option", { value: "video", children: "Video" }), _jsx("option", { value: "podcast", children: "Podcast" }), _jsx("option", { value: "gallery", children: "Gallery" }), _jsx("option", { value: "document", children: "Document" })] }), _jsxs(Select, { value: statusFilter, onValueChange: (value) => setStatusFilter(value), children: [_jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "scheduled", children: "Scheduled" }), _jsx("option", { value: "published", children: "Published" }), _jsx("option", { value: "unpublished", children: "Unpublished" }), _jsx("option", { value: "archived", children: "Archived" })] }), _jsxs(Select, { value: dateRange, onValueChange: (value) => setDateRange(value), children: [_jsx("option", { value: "today", children: "Today" }), _jsx("option", { value: "week", children: "Last Week" }), _jsx("option", { value: "month", children: "Last Month" }), _jsx("option", { value: "all", children: "All Time" })] })] }), _jsxs("div", { className: "action-buttons", children: [_jsxs(Button, { onClick: loadData, disabled: isLoading, variant: "outline", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${isLoading ? 'animate-spin' : ''}` }), "Refresh"] }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Content"] })] })] }), _jsx("div", { className: "content-grid", children: filteredContent.map(item => (_jsx(ContentCard, { content: item, onSelect: setSelectedContent, onPublish: handlePublishContent, onUnpublish: handleUnpublishContent, onSchedule: handleScheduleContent, userRole: userRole }, item.id))) }), filteredContent.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No content found" }), _jsx("p", { className: "text-gray-500", children: "Try adjusting your filters or create new content." })] }))] }));
    const renderBatchOperations = () => (_jsxs("div", { className: "batch-section", children: [_jsxs("div", { className: "batch-header", children: [_jsx("h3", { children: "Batch Operations" }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Batch"] })] }), _jsx("div", { className: "batch-list", children: batches.map(batch => (_jsx(BatchCard, { batch: batch, onExecute: (id) => console.log('Execute batch:', id), onCancel: (id) => console.log('Cancel batch:', id) }, batch.id))) }), batches.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx(Settings, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No batch operations" }), _jsx("p", { className: "text-gray-500", children: "Create a batch operation to manage multiple content items." })] }))] }));
    const renderAnalytics = () => {
        if (!stats)
            return _jsx("div", { children: "Loading analytics..." });
        return (_jsx("div", { className: "analytics-section", children: _jsx("div", { className: "analytics-grid", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Content Type Performance" }) }), _jsx(CardContent, { children: _jsx("div", { className: "type-performance", children: Object.entries(stats.performanceMetrics.contentTypePerformance).map(([type, performance]) => {
                                    const config = CONTENT_TYPE_CONFIG[type];
                                    const Icon = config.icon;
                                    return (_jsxs("div", { className: "type-item", children: [_jsxs("div", { className: "type-info", children: [_jsx(Icon, { className: `w-4 h-4 ${config.color.split(' ')[0]}` }), _jsx("span", { className: "type-name", children: type.replace('_', ' ') })] }), _jsxs("div", { className: "type-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Count:" }), _jsx("span", { className: "stat-value", children: performance.count })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Avg Views:" }), _jsx("span", { className: "stat-value", children: performance.averageViews.toFixed(0) })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Engagement:" }), _jsxs("span", { className: "stat-value", children: [performance.averageEngagement.toFixed(1), "%"] })] })] })] }, type));
                                }) }) })] }) }) }));
    };
    return (_jsxs("div", { className: `content-scheduling-dashboard ${className}`, children: [_jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Content Scheduling" }), _jsx("p", { children: "Manage content lifecycle, publication scheduling, and performance" })] }), _jsx("div", { className: "header-actions", children: _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Report"] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsxs(TabsTrigger, { value: "content", children: ["Content", _jsx(Badge, { className: "ml-2 text-xs", children: content.length })] }), _jsx(TabsTrigger, { value: "batch", children: "Batch Operations" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "overview", className: "tab-content", children: renderOverview() }), _jsx(TabsContent, { value: "content", className: "tab-content", children: renderContentList() }), _jsx(TabsContent, { value: "batch", className: "tab-content", children: renderBatchOperations() }), _jsx(TabsContent, { value: "analytics", className: "tab-content", children: renderAnalytics() })] }), selectedContent && (_jsx(ContentDetailModal, { content: selectedContent, onClose: () => setSelectedContent(null), onUpdate: loadData, userRole: userRole })), _jsx("style", { jsx: true, children: `
        .content-scheduling-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        }

        .overview-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .metric-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .metric-info {
          flex: 1;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .metric-change {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .metric-change.positive {
          color: #059669;
        }

        .upcoming-section {
          margin-top: 1rem;
        }

        .upcoming-schedules {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .schedule-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .schedule-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 120px;
          font-weight: 500;
          color: #1f2937;
        }

        .schedule-preview {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .preview-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .item-title {
          color: #1f2937;
        }

        .preview-more {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .performance-section {
          margin-top: 1rem;
        }

        .performance-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .performance-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .item-info {
          flex: 1;
        }

        .item-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .item-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .item-chart {
          width: 100px;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }

        .performance-bar {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .content-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .search-filters {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-bar .lucide {
          position: absolute;
          left: 0.75rem;
          z-index: 1;
        }

        .search-input {
          padding-left: 2.25rem;
          min-width: 300px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
        }

        .batch-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .batch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .batch-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .batch-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .analytics-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .analytics-grid {
          display: grid;
          gap: 1rem;
        }

        .type-performance {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .type-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .type-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .type-name {
          font-weight: 500;
          color: #1f2937;
          text-transform: capitalize;
        }

        .type-stats {
          display: flex;
          gap: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
        }

        .stat-label {
          color: #6b7280;
        }

        .stat-value {
          color: #1f2937;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .empty-state h3 {
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .content-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .search-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: auto;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .schedule-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .type-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .type-stats {
            justify-content: space-between;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      ` })] }));
};
const ContentCard = ({ content, onSelect, onPublish, onUnpublish, onSchedule, userRole }) => {
    const typeConfig = CONTENT_TYPE_CONFIG[content.type];
    const statusConfig = STATUS_CONFIG[content.status];
    const TypeIcon = typeConfig.icon;
    const StatusIcon = statusConfig.icon;
    const canPublish = userRole === 'admin' || userRole === 'editor';
    return (_jsxs(Card, { className: "content-card", children: [_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "content-card-header", children: [_jsxs("div", { className: "content-info", children: [_jsx("div", { className: "content-title", children: content.title }), _jsx("div", { className: "content-description", children: content.content.description || 'No description' })] }), _jsxs("div", { className: "content-badges", children: [_jsxs(Badge, { className: typeConfig.color, children: [_jsx(TypeIcon, { className: "w-3 h-3 mr-1" }), content.type] }), _jsxs(Badge, { className: statusConfig.color, children: [_jsx(StatusIcon, { className: "w-3 h-3 mr-1" }), content.status] })] })] }), _jsxs("div", { className: "content-details", children: [_jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Author:" }), _jsx("span", { className: "detail-value", children: content.createdBy })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Created:" }), _jsx("span", { className: "detail-value", children: content.createdAt.toLocaleDateString() })] }), content.scheduling.publishAt && (_jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Scheduled:" }), _jsx("span", { className: "detail-value", children: content.scheduling.publishAt.toLocaleString() })] })), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Views:" }), _jsx("span", { className: "detail-value", children: content.performance.views.toLocaleString() })] })] }), _jsxs("div", { className: "content-actions", children: [_jsxs(Button, { onClick: () => onSelect(content), variant: "outline", size: "sm", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "View"] }), canPublish && content.status === 'draft' && (_jsxs(Button, { onClick: () => onPublish(content.id), size: "sm", children: [_jsx(PlayCircle, { className: "w-4 h-4 mr-1" }), "Publish"] })), canPublish && content.status === 'published' && (_jsxs(Button, { onClick: () => onUnpublish(content.id), size: "sm", variant: "outline", children: [_jsx(PauseCircle, { className: "w-4 h-4 mr-1" }), "Unpublish"] })), canPublish && (content.status === 'draft' || content.status === 'scheduled') && (_jsxs(Button, { onClick: () => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    onSchedule(content.id, tomorrow);
                                }, size: "sm", variant: "outline", children: [_jsx(Clock, { className: "w-4 h-4 mr-1" }), "Schedule"] }))] })] }), _jsx("style", { jsx: true, children: `
        .content-card {
          transition: box-shadow 0.2s ease;
        }

        .content-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .content-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .content-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .content-description {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .content-badges {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: flex-end;
        }

        .content-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: #1f2937;
          text-align: right;
        }

        .content-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
      ` })] }));
};
const BatchCard = ({ batch, onExecute, onCancel }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'processing': return 'text-blue-600 bg-blue-100';
            case 'completed': return 'text-green-600 bg-green-100';
            case 'failed': return 'text-red-600 bg-red-100';
            case 'cancelled': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const progressPercentage = batch.progress.total > 0
        ? (batch.progress.completed / batch.progress.total) * 100
        : 0;
    return (_jsxs(Card, { className: "batch-card", children: [_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "batch-header", children: [_jsxs("div", { className: "batch-info", children: [_jsx("div", { className: "batch-name", children: batch.name }), _jsx("div", { className: "batch-operation", children: batch.operation.type.replace('_', ' ').toUpperCase() })] }), _jsx(Badge, { className: getStatusColor(batch.status), children: batch.status.toUpperCase() })] }), _jsxs("div", { className: "batch-progress", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${progressPercentage}%` } }) }), _jsxs("div", { className: "progress-text", children: [batch.progress.completed, " / ", batch.progress.total, " completed"] })] }), _jsxs("div", { className: "batch-actions", children: [batch.status === 'pending' && (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: () => onExecute(batch.id), size: "sm", children: "Execute" }), _jsx(Button, { onClick: () => onCancel(batch.id), size: "sm", variant: "outline", children: "Cancel" })] })), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "Details"] })] })] }), _jsx("style", { jsx: true, children: `
        .batch-card {
          transition: box-shadow 0.2s ease;
        }

        .batch-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .batch-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .batch-operation {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .batch-progress {
          margin-bottom: 1rem;
        }

        .progress-bar {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .batch-actions {
          display: flex;
          gap: 0.5rem;
        }
      ` })] }));
};
const ContentDetailModal = ({ content, onClose, onUpdate, _____userRole }) => {
    return (_jsxs("div", { className: "modal-overlay", children: [_jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("h2", { children: ["Content Details: ", content.title] }), _jsx(Button, { onClick: onClose, variant: "outline", size: "sm", children: "\u2715" })] }), _jsx("div", { className: "modal-body", children: _jsxs("div", { className: "content-details", children: [_jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Basic Information" }), _jsxs("div", { className: "detail-grid", children: [_jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Title:" }), _jsx("span", { children: content.title })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Type:" }), _jsx(Badge, { className: CONTENT_TYPE_CONFIG[content.type].color, children: content.type })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Status:" }), _jsx(Badge, { className: STATUS_CONFIG[content.status].color, children: content.status })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Author:" }), _jsx("span", { children: content.createdBy })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Created:" }), _jsx("span", { children: content.createdAt.toLocaleString() })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Updated:" }), _jsx("span", { children: content.updatedAt.toLocaleString() })] })] })] }), content.scheduling.publishAt && (_jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Scheduling" }), _jsxs("div", { className: "detail-grid", children: [_jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Publish At:" }), _jsx("span", { children: content.scheduling.publishAt.toLocaleString() })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Timezone:" }), _jsx("span", { children: content.scheduling.timezone })] })] })] })), _jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Performance" }), _jsxs("div", { className: "detail-grid", children: [_jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Views:" }), _jsx("span", { children: content.performance.views.toLocaleString() })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Engagement:" }), _jsxs("span", { children: [content.performance.engagement.toFixed(1), "%"] })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Shares:" }), _jsx("span", { children: content.performance.shares.toLocaleString() })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Likes:" }), _jsx("span", { children: content.performance.likes.toLocaleString() })] })] })] })] }) }), _jsxs("div", { className: "modal-footer", children: [_jsx(Button, { onClick: onClose, variant: "outline", children: "Close" }), _jsx(Button, { onClick: () => { onUpdate(); onClose(); }, children: "Edit Content" })] })] }), _jsx("style", { jsx: true, children: `
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90vw;
          max-width: 700px;
          max-height: 80vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .content-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item label {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .detail-item span {
          color: #1f2937;
          font-size: 0.875rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95vw;
            max-height: 90vh;
          }
        }
      ` })] }));
};
export default ContentSchedulingDashboard;
