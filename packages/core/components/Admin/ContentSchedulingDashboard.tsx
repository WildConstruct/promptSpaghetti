/**
 * Content Scheduling Dashboard - Epic 17
 * 
 * Comprehensive content scheduling interface for managing content lifecycle,
 * publication scheduling, promotions, and performance tracking.
 * 
 * Task: E17-1753114396947-96EB34 - Design content scheduling
 * Epic: 17 - Backstage Admin Controls
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  Calendar,
  Clock,
  PlayCircle,
  PauseCircle,
  // StopCircle, // Unused import
  Edit,
  Eye,
  TrendingUp,
  Users,
  FileText,
  Image,
  Video,
  Megaphone,
  Archive,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Globe,
  Target,
  Share2,
  Bell
} from 'lucide-react';

import {
  contentSchedulingService,
  ContentItem,
  ContentType,
  ContentStatus,
  ContentFilter,
  SchedulingStats,
  ScheduleBatch
} from '../../services/ContentSchedulingService';

interface ContentSchedulingDashboardProps {
  className?: string;
  userId?: string;
  userRole?: string;
}

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

export const ContentSchedulingDashboard: React.FC<ContentSchedulingDashboardProps> = ({
  className = '',
  userId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [batches, setBatches] = useState<ScheduleBatch[]>([]);
  const [stats, setStats] = useState<SchedulingStats | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [_____filter, _____setFilter] = useState<ContentFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

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
      const contentFilter: ContentFilter = {
        searchQuery: searchQuery || undefined,
        types: typeFilter !== 'all' ? [typeFilter] : undefined,
        statuses: statusFilter !== 'all' ? [statusFilter] : undefined
      };

      // Add date range filter
      if (dateRange !== 'all') {
        const now = new Date();
        let start: Date;
        
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

    } catch (error) {
      console.error('Failed to load scheduling data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishContent = async (contentId: string) => {
    try {
      await contentSchedulingService.publishContent(contentId, userId || 'admin');
      loadData();
    } catch (error) {
      console.error('Failed to publish content:', error);
    }
  };

  const handleUnpublishContent = async (contentId: string) => {
    try {
      await contentSchedulingService.unpublishContent(contentId, userId || 'admin');
      loadData();
    } catch (error) {
      console.error('Failed to unpublish content:', error);
    }
  };

  const handleScheduleContent = async (contentId: string, publishAt: Date) => {
    try {
      await contentSchedulingService.scheduleContent(contentId, {
        publishAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }, userId || 'admin');
      loadData();
    } catch (error) {
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
    if (!stats) return <div>Loading overview...</div>;

    return (
      <div className="overview-section">
        <div className="metrics-grid">
          <Card>
            <CardContent className="p-6">
              <div className="metric-item">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="metric-info">
                  <div className="metric-label">Total Content</div>
                  <div className="metric-value">{stats.totalContent}</div>
                  <div className="metric-change">All content items</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="metric-item">
                <Clock className="w-8 h-8 text-orange-600" />
                <div className="metric-info">
                  <div className="metric-label">Scheduled</div>
                  <div className="metric-value">{stats.scheduledContent}</div>
                  <div className="metric-change">Awaiting publication</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="metric-item">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="metric-info">
                  <div className="metric-label">Published Today</div>
                  <div className="metric-value">{stats.publishedToday}</div>
                  <div className="metric-change positive">Successfully published</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="metric-item">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="metric-info">
                  <div className="metric-label">Avg Views</div>
                  <div className="metric-value">
                    {stats.performanceMetrics.averageViewsPerPost.toFixed(0)}
                  </div>
                  <div className="metric-change">Per published post</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="upcoming-section">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="upcoming-schedules">
                {stats.upcomingSchedules.slice(0, 5).map((schedule, index) => (
                  <div key={index} className="schedule-item">
                    <div className="schedule-date">
                      <Calendar className="w-4 h-4" />
                      <span>{schedule.date.toLocaleDateString()}</span>
                    </div>
                    <div className="schedule-count">
                      <Badge className="bg-blue-100 text-blue-800">
                        {schedule.count} items
                      </Badge>
                    </div>
                    <div className="schedule-preview">
                      {schedule.items.slice(0, 3).map(item => (
                        <div key={item.id} className="preview-item">
                          <span className="item-title">{item.title}</span>
                          <Badge className={CONTENT_TYPE_CONFIG[item.type].color} size="sm">
                            {item.type}
                          </Badge>
                        </div>
                      ))}
                      {schedule.items.length > 3 && (
                        <div className="preview-more">
                          +{schedule.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="performance-section">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="performance-list">
                {stats.performanceMetrics.topPerformingContent.map(item => (
                  <div key={item.id} className="performance-item">
                    <div className="item-info">
                      <div className="item-title">{item.title}</div>
                      <div className="item-stats">
                        <span>{item.views.toLocaleString()} views</span>
                        <span>{item.engagement.toFixed(1)}% engagement</span>
                      </div>
                    </div>
                    <div className="item-chart">
                      <div 
                        className="performance-bar"
                        style={{ 
                          width: `${Math.min(
                            100,
                            (item.views / Math.max(...stats.performanceMetrics.topPerformingContent.map(c => c.views
                          ))) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderContentList = () => (
    <div className="content-section">
      {/* Controls */}
      <div className="content-controls">
        <div className="search-filters">
          <div className="search-bar">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as ContentType | 'all')}
          >
            <option value="all">All Types</option>
            <option value="article">Article</option>
            <option value="blog_post">Blog Post</option>
            <option value="page">Page</option>
            <option value="product">Product</option>
            <option value="event">Event</option>
            <option value="announcement">Announcement</option>
            <option value="promotion">Promotion</option>
            <option value="newsletter">Newsletter</option>
            <option value="social_post">Social Post</option>
            <option value="video">Video</option>
            <option value="podcast">Podcast</option>
            <option value="gallery">Gallery</option>
            <option value="document">Document</option>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ContentStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
            <option value="archived">Archived</option>
          </Select>

          <Select
            value={dateRange}
            onValueChange={(value) => setDateRange(value as typeof dateRange)}
          >
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="all">All Time</option>
          </Select>
        </div>

        <div className="action-buttons">
          <Button onClick={loadData} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {filteredContent.map(item => (
          <ContentCard
            key={item.id}
            content={item}
            onSelect={setSelectedContent}
            onPublish={handlePublishContent}
            onUnpublish={handleUnpublishContent}
            onSchedule={handleScheduleContent}
            userRole={userRole}
          />
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="empty-state">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-500">Try adjusting your filters or create new content.</p>
        </div>
      )}
    </div>
  );

  const renderBatchOperations = () => (
    <div className="batch-section">
      <div className="batch-header">
        <h3>Batch Operations</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Batch
        </Button>
      </div>

      <div className="batch-list">
        {batches.map(batch => (
          <BatchCard
            key={batch.id}
            batch={batch}
            onExecute={(id) => console.log('Execute batch:', id)}
            onCancel={(id) => console.log('Cancel batch:', id)}
          />
        ))}
      </div>

      {batches.length === 0 && (
        <div className="empty-state">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No batch operations</h3>
          <p className="text-gray-500">Create a batch operation to manage multiple content items.</p>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => {
    if (!stats) return <div>Loading analytics...</div>;

    return (
      <div className="analytics-section">
        <div className="analytics-grid">
          <Card>
            <CardHeader>
              <CardTitle>Content Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="type-performance">
                {Object.entries(stats.performanceMetrics.contentTypePerformance).map(([type, performance]) => {
                  const config = CONTENT_TYPE_CONFIG[type as ContentType];
                  const Icon = config.icon;
                  
                  return (
                    <div key={type} className="type-item">
                      <div className="type-info">
                        <Icon className={`w-4 h-4 ${config.color.split(' ')[0]}`} />
                        <span className="type-name">{type.replace('_', ' ')}</span>
                      </div>
                      <div className="type-stats">
                        <div className="stat">
                          <span className="stat-label">Count:</span>
                          <span className="stat-value">{performance.count}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Avg Views:</span>
                          <span className="stat-value">{performance.averageViews.toFixed(0)}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Engagement:</span>
                          <span className="stat-value">{performance.averageEngagement.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className={`content-scheduling-dashboard ${className}`}>
      <div className="dashboard-header">
        <div className="header-info">
          <h2>Content Scheduling</h2>
          <p>Manage content lifecycle, publication scheduling, and performance</p>
        </div>
        
        <div className="header-actions">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">
            Content
            <Badge className="ml-2 text-xs">{content.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="batch">Batch Operations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="tab-content">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="content" className="tab-content">
          {renderContentList()}
        </TabsContent>

        <TabsContent value="batch" className="tab-content">
          {renderBatchOperations()}
        </TabsContent>

        <TabsContent value="analytics" className="tab-content">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>

      {/* Content Detail Modal */}
      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onUpdate={loadData}
          userRole={userRole}
        />
      )}

      <style>{`
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
      `}</style>
    </div>
  );
};

// Content Card Component
interface ContentCardProps {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
  onPublish: (contentId: string) => void;
  onUnpublish: (contentId: string) => void;
  onSchedule: (contentId: string, publishAt: Date) => void;
  userRole?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  onSelect, 
  onPublish, 
  onUnpublish, 
  onSchedule, 
  userRole 
}) => {
  const typeConfig = CONTENT_TYPE_CONFIG[content.type];
  const statusConfig = STATUS_CONFIG[content.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const canPublish = userRole === 'admin' || userRole === 'editor';

  return (
    <Card className="content-card">
      <CardContent className="p-4">
        <div className="content-card-header">
          <div className="content-info">
            <div className="content-title">{content.title}</div>
            <div className="content-description">
              {content.content.description || 'No description'}
            </div>
          </div>
          <div className="content-badges">
            <Badge className={typeConfig.color}>
              <TypeIcon className="w-3 h-3 mr-1" />
              {content.type}
            </Badge>
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {content.status}
            </Badge>
          </div>
        </div>

        <div className="content-details">
          <div className="detail-item">
            <span className="detail-label">Author:</span>
            <span className="detail-value">{content.createdBy}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Created:</span>
            <span className="detail-value">
              {content.createdAt.toLocaleDateString()}
            </span>
          </div>
          {content.scheduling.publishAt && (
            <div className="detail-item">
              <span className="detail-label">Scheduled:</span>
              <span className="detail-value">
                {content.scheduling.publishAt.toLocaleString()}
              </span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Views:</span>
            <span className="detail-value">
              {content.performance.views.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="content-actions">
          <Button 
            onClick={() => onSelect(content)} 
            variant="outline" 
            size="sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          
          {canPublish && content.status === 'draft' && (
            <Button 
              onClick={() => onPublish(content.id)} 
              size="sm"
            >
              <PlayCircle className="w-4 h-4 mr-1" />
              Publish
            </Button>
          )}
          
          {canPublish && content.status === 'published' && (
            <Button 
              onClick={() => onUnpublish(content.id)} 
              size="sm"
              variant="outline"
            >
              <PauseCircle className="w-4 h-4 mr-1" />
              Unpublish
            </Button>
          )}
          
          {canPublish && (content.status === 'draft' || content.status === 'scheduled') && (
            <Button 
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                onSchedule(content.id, tomorrow);
              }}
              size="sm"
              variant="outline"
            >
              <Clock className="w-4 h-4 mr-1" />
              Schedule
            </Button>
          )}
        </div>
      </CardContent>

      <style>{`
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
      `}</style>
    </Card>
  );
};

// Batch Card Component
interface BatchCardProps {
  batch: ScheduleBatch;
  onExecute: (batchId: string) => void;
  onCancel: (batchId: string) => void;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch, onExecute, onCancel }) => {
  const getStatusColor = (status: string) => {
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

  return (
    <Card className="batch-card">
      <CardContent className="p-4">
        <div className="batch-header">
          <div className="batch-info">
            <div className="batch-name">{batch.name}</div>
            <div className="batch-operation">
              {batch.operation.type.replace('_', ' ').toUpperCase()}
            </div>
          </div>
          <Badge className={getStatusColor(batch.status)}>
            {batch.status.toUpperCase()}
          </Badge>
        </div>

        <div className="batch-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="progress-text">
            {batch.progress.completed} / {batch.progress.total} completed
          </div>
        </div>

        <div className="batch-actions">
          {batch.status === 'pending' && (
            <>
              <Button onClick={() => onExecute(batch.id)} size="sm">
                Execute
              </Button>
              <Button onClick={() => onCancel(batch.id)} size="sm" variant="outline">
                Cancel
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
        </div>
      </CardContent>

      <style>{`
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
      `}</style>
    </Card>
  );
};

// Content Detail Modal Component (simplified)
interface ContentDetailModalProps {
  content: ContentItem;
  onClose: () => void;
  onUpdate: () => void;
  userRole?: string;
}

const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  content,
  onClose,
  onUpdate,
  userRole
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Content Details: {content.title}</h2>
          <Button onClick={onClose} variant="outline" size="sm">
            ✕
          </Button>
        </div>

        <div className="modal-body">
          <div className="content-details">
            <div className="detail-section">
              <h3>Basic Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Title:</label>
                  <span>{content.title}</span>
                </div>
                <div className="detail-item">
                  <label>Type:</label>
                  <Badge className={CONTENT_TYPE_CONFIG[content.type].color}>
                    {content.type}
                  </Badge>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <Badge className={STATUS_CONFIG[content.status].color}>
                    {content.status}
                  </Badge>
                </div>
                <div className="detail-item">
                  <label>Author:</label>
                  <span>{content.createdBy}</span>
                </div>
                <div className="detail-item">
                  <label>Created:</label>
                  <span>{content.createdAt.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Updated:</label>
                  <span>{content.updatedAt.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {content.scheduling.publishAt && (
              <div className="detail-section">
                <h3>Scheduling</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Publish At:</label>
                    <span>{content.scheduling.publishAt.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Timezone:</label>
                    <span>{content.scheduling.timezone}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3>Performance</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Views:</label>
                  <span>{content.performance.views.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Engagement:</label>
                  <span>{content.performance.engagement.toFixed(1)}%</span>
                </div>
                <div className="detail-item">
                  <label>Shares:</label>
                  <span>{content.performance.shares.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Likes:</label>
                  <span>{content.performance.likes.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button onClick={() => { onUpdate(); onClose(); }}>
            Edit Content
          </Button>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default ContentSchedulingDashboard;