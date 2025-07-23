/**
 * Marketplace Dashboard - E17-1753114397415-AFF06F
 * 
 * Comprehensive marketplace analytics dashboard for business intelligence
 * and template performance tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useMarketplaceMetrics } from '../../hooks/useMarketplaceMetrics';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Heart,
  Share,
  Search,
  Users,
  Star,
  Target
} from 'lucide-react';

export interface MarketplaceDashboardProps {
  userId?: number;
  userRole?: 'director' | 'producer' | 'creator' | 'admin';
  timeRange?: string;
  className?: string;
}

export const MarketplaceDashboard: React.FC<MarketplaceDashboardProps> = ({
  userId,
  userRole = 'director',
  timeRange = '30d',
  className = ''
}) => {
  const {
    dashboardData,
    insights,
    isLoading,
    getTopPerformingTemplates,
    getSearchAnalytics,
    refreshData
  } = useMarketplaceMetrics({ userRole });

  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'downloads' | 'rating'>('revenue');
  const [topTemplates, setTopTemplates] = useState<any[]>([]);
  const [searchData, setSearchData] = useState<unknown>(null);

  useEffect(() => {
    if (!isLoading && dashboardData) {
      const templates = getTopPerformingTemplates(selectedMetric, 10);
      const search = getSearchAnalytics();
      setTopTemplates(templates);
      setSearchData(search);
    }
  }, [isLoading, dashboardData, selectedMetric, getTopPerformingTemplates, getSearchAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const renderOverviewMetrics = () => {
    if (!dashboardData) return null;

    const { overview, trends } = dashboardData;

    return (
      <div className="overview-metrics">
        <div className="metrics-grid">
          <Card className="metric-card revenue">
            <CardHeader>
              <CardTitle className="metric-title">
                <DollarSign className="w-5 h-5" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">{formatCurrency(overview.totalRevenue)}</div>
              <div className="metric-trend">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="trend-value">+{trends.revenueGrowth.toFixed(1)}%</span>
                <span className="trend-period">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card transactions">
            <CardHeader>
              <CardTitle className="metric-title">
                <Download className="w-5 h-5" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">{formatNumber(overview.totalTransactions)}</div>
              <div className="metric-trend">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="trend-value">+{trends.transactionGrowth.toFixed(1)}%</span>
                <span className="trend-period">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card templates">
            <CardHeader>
              <CardTitle className="metric-title">
                <Target className="w-5 h-5" />
                Active Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">{overview.activeTemplates}</div>
              <div className="metric-subtitle">Live in marketplace</div>
            </CardContent>
          </Card>

          <Card className="metric-card creators">
            <CardHeader>
              <CardTitle className="metric-title">
                <Users className="w-5 h-5" />
                Active Creators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">{overview.activeCreators}</div>
              <div className="metric-trend">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="trend-value">+{trends.userGrowth.toFixed(1)}%</span>
                <span className="trend-period">growth rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card rating">
            <CardHeader>
              <CardTitle className="metric-title">
                <Star className="w-5 h-5" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">{overview.averageRating.toFixed(1)}</div>
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(overview.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card conversion">
            <CardHeader>
              <CardTitle className="metric-title">
                <Target className="w-5 h-5" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value">{overview.conversionRate.toFixed(1)}%</div>
              <div className="metric-subtitle">View to purchase</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderTopCategories = () => {
    if (!dashboardData?.trends.topCategories) return null;

    return (
      <Card className="top-categories-card">
        <CardHeader>
          <CardTitle>Top Performing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="categories-list">
            {dashboardData.trends.topCategories.map((category: unknown, index: number) => (
              <div key={category.category} className="category-item">
                <div className="category-info">
                  <div className="category-rank">#{index + 1}</div>
                  <div className="category-details">
                    <div className="category-name">{category.category}</div>
                    <div className="category-revenue">{formatCurrency(category.revenue)}</div>
                  </div>
                </div>
                <div className="category-growth">
                  <Badge variant={category.growth > 0 ? 'default' : 'secondary'}>
                    {category.growth > 0 ? '+' : ''}{category.growth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTopTemplates = () => {
    return (
      <Card className="top-templates-card">
        <CardHeader>
          <div className="templates-header">
            <CardTitle>Top Performing Templates</CardTitle>
            <Select value={selectedMetric} onValueChange={(value: Error) => setSelectedMetric(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">By Revenue</SelectItem>
                <SelectItem value="downloads">By Downloads</SelectItem>
                <SelectItem value="rating">By Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="templates-list">
            {topTemplates.map((template, index) => (
              <div key={template.templateId} className="template-item">
                <div className="template-rank">#{index + 1}</div>
                <div className="template-info">
                  <div className="template-name">{template.name}</div>
                  <div className="template-category">
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </div>
                <div className="template-metrics">
                  {selectedMetric === 'revenue' && (
                    <div className="metric-primary">{formatCurrency(template.metrics.revenue.total)}</div>
                  )}
                  {selectedMetric === 'downloads' && (
                    <div className="metric-primary">{formatNumber(template.metrics.downloads)}</div>
                  )}
                  {selectedMetric === 'rating' && (
                    <div className="metric-primary">{template.metrics.ratings.average.toFixed(1)} ★</div>
                  )}
                  <div className="metric-secondary">
                    <span>{formatNumber(template.metrics.views)} views</span>
                    <span>{template.metrics.favorites} ♥</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSearchAnalytics = () => {
    if (!searchData) return null;

    return (
      <div className="search-analytics">
        <Card className="search-overview">
          <CardHeader>
            <CardTitle>
              <Search className="w-5 h-5" />
              Search Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="search-metrics">
              <div className="search-stat">
                <div className="stat-value">{formatNumber(searchData.totalSearches || 0)}</div>
                <div className="stat-label">Total Searches</div>
              </div>
              <div className="search-stat">
                <div className="stat-value">{searchData.averageCTR?.toFixed(1) || 0}%</div>
                <div className="stat-label">Average CTR</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="top-queries">
          <CardHeader>
            <CardTitle>Top Search Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="queries-list">
              {searchData.topQueries?.slice(0, 8).map((query: unknown, index: number) => (
                <div key={query.query} className="query-item">
                  <div className="query-rank">#{index + 1}</div>
                  <div className="query-info">
                    <div className="query-text">"{query.query}"</div>
                    <div className="query-stats">
                      <span>{query.count} searches</span>
                      <span>{query.ctr.toFixed(1)}% CTR</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInsights = () => {
    return (
      <Card className="insights-card">
        <CardHeader>
          <CardTitle>Marketplace Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="insights-list">
            {insights.map((insight: unknown, index: number) => (
              <div key={index} className={`insight-item ${insight.impact}`}>
                <div className="insight-icon">
                  {insight.type === 'opportunity' && <TrendingUp className="w-5 h-5" />}
                  {insight.type === 'trend' && <Target className="w-5 h-5" />}
                  {insight.type === 'optimization' && <Users className="w-5 h-5" />}
                </div>
                <div className="insight-content">
                  <div className="insight-header">
                    <div className="insight-title">{insight.title}</div>
                    <Badge variant={insight.impact === 'high' ? 'default' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <div className="insight-description">{insight.description}</div>
                  <div className="insight-action">
                    <Button variant="outline" size="sm">{insight.action}</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="marketplace-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading marketplace analytics...</p>
      </div>
    );
  }

  return (
    <div className={`marketplace-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>Marketplace Analytics</h2>
        <Button onClick={refreshData} variant="outline">
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="dashboard-tabs">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="tab-content">
          <div className="overview-content">
            {renderOverviewMetrics()}
            {renderTopCategories()}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="tab-content">
          {renderTopTemplates()}
        </TabsContent>

        <TabsContent value="search" className="tab-content">
          {renderSearchAnalytics()}
        </TabsContent>

        <TabsContent value="insights" className="tab-content">
          {renderInsights()}
        </TabsContent>
      </Tabs>

      <style jsx>{`
        .marketplace-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dashboard-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          transition: transform 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
        }

        .metric-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0.5rem 0;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
        }

        .trend-value {
          font-weight: 600;
          color: #059669;
        }

        .trend-period {
          color: #9ca3af;
        }

        .metric-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .rating-stars {
          display: flex;
          gap: 0.125rem;
          margin-top: 0.25rem;
        }

        .categories-list, .templates-list, .queries-list, .insights-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .category-item, .template-item, .query-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .category-info, .template-info, .query-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .category-rank, .template-rank, .query-rank {
          font-weight: 600;
          color: #6b7280;
          min-width: 2rem;
        }

        .category-name, .template-name, .query-text {
          font-weight: 600;
          color: #1f2937;
        }

        .category-revenue, .metric-primary {
          font-size: 1.1rem;
          font-weight: 600;
          color: #059669;
        }

        .metric-secondary {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .query-stats {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .templates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-analytics {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1rem;
        }

        .search-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .search-stat {
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .insight-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .insight-item.high {
          border-left-color: #dc2626;
        }

        .insight-item.medium {
          border-left-color: #f59e0b;
        }

        .insight-item.low {
          border-left-color: #10b981;
        }

        .insight-icon {
          flex-shrink: 0;
          padding: 0.5rem;
          background: #f3f4f6;
          border-radius: 8px;
        }

        .insight-content {
          flex: 1;
        }

        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .insight-title {
          font-weight: 600;
          color: #1f2937;
        }

        .insight-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem;
          gap: 1rem;
        }

        .loading-spinner {
          width: 2rem;
          height: 2rem;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .search-analytics {
            grid-template-columns: 1fr;
          }

          .templates-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplaceDashboard;