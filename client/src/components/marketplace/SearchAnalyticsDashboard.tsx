// Epic 16 Story 16.1 - Search Analytics Dashboard
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { API_URL } from '../../config/environment';

// Analytics interface for search data structure - commented out as unused
// interface SearchAnalytics {
//   period_start: Date;
//   period_end: Date;
//   total_searches: number;
//   unique_users: number;
//   top_queries: Array<{ query: string; count: number; avg_results: number }>;
//   popular_filters: Array<{ filter: string; value: string; count: number }>;
//   zero_result_queries: Array<{ query: string; count: number }>;
//   search_trends: Array<{ date: string; searches: number; unique_users: number }>;
//   conversion_metrics: {
//     search_to_view: number;
//     search_to_purchase: number;
//     avg_time_to_action: number;
//   };
// }

interface SearchInsights {
  trending_topics: string[];
  emerging_queries: string[];
  declining_queries: string[];
  zero_result_opportunities: string[];
  popular_categories: Array<{ category: string; searches: number }>;
}

interface PopularTerm {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export   const [popularTerms, setPopularTerms] = useState<PopularTerm[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsRes, popularTermsRes, insightsRes] = await Promise.all([
        fetch(`${API_URL}/api/marketplace/analytics/search?start_date=${dateRange.start}&end_date=${dateRange.end}`, {
          headers: getAuthHeaders()
        }),
        fetch(`${API_URL}/api/marketplace/analytics/search/popular-terms?timeframe=${timeframe}&limit=20`, {
          headers: getAuthHeaders()
        }),
        fetch(`${API_URL}/api/marketplace/analytics/search/insights`, {
          headers: getAuthHeaders()
        })
      ]);

      if (!analyticsRes.ok || !popularTermsRes.ok || !insightsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [analyticsData, popularTermsData, insightsData] = await Promise.all([
        analyticsRes.json(),
        popularTermsRes.json(),
        insightsRes.json()
      ]);

      setAnalytics(analyticsData);
      setPopularTerms(popularTermsData.popular_terms || []);
      setInsights(insightsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [timeframe, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => `${(num * 100).toFixed(1)}%`;

  if (loading) {
    return (
      <div className="search-analytics-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading search analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-analytics-dashboard error">
        <div className="error-message">
          <h3>Failed to load analytics</h3>
          <p>{error}</p>
          <button onClick={fetchAnalytics} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="search-analytics-dashboard">
      <div className="dashboard-header">
        <h1>Search Analytics Dashboard</h1>
        <div className="controls">
          <div className="date-range-selector">
            <label>Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div className="timeframe-selector">
            <label>Timeframe:</label>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value as 'day' | 'week' | 'month')}>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Searches</h3>
          <div className="metric">{formatNumber(analytics?.total_searches || 0)}</div>
        </div>
        <div className="summary-card">
          <h3>Unique Users</h3>
          <div className="metric">{formatNumber(analytics?.unique_users || 0)}</div>
        </div>
        <div className="summary-card">
          <h3>Search to View</h3>
          <div className="metric">{formatPercentage(analytics?.conversion_metrics.search_to_view || 0)}</div>
        </div>
        <div className="summary-card">
          <h3>Search to Purchase</h3>
          <div className="metric">{formatPercentage(analytics?.conversion_metrics.search_to_purchase || 0)}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Search Trends */}
        <div className="chart-container">
          <h3>Search Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.search_trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="searches" stroke="#8884d8" name="Total Searches" />
              <Line type="monotone" dataKey="unique_users" stroke="#82ca9d" name="Unique Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Queries */}
        <div className="chart-container">
          <h3>Top Search Queries</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.top_queries.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="query" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name="Search Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Categories */}
        <div className="chart-container">
          <h3>Popular Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={insights?.popular_categories || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="searches"
              >
                {(insights?.popular_categories || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Filters */}
        <div className="chart-container">
          <h3>Popular Filter Combinations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.popular_filters.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="value" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" name="Usage Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <div className="insights-grid">
          {/* Popular Terms with Trends */}
          <div className="insight-card">
            <h3>Popular Search Terms</h3>
            <div className="popular-terms-list">
              {popularTerms.slice(0, 10).map((term, index) => (
                <div key={term.query} className="popular-term">
                  <span className="rank">#{index + 1}</span>
                  <span className="query">{term.query}</span>
                  <span className="count">{formatNumber(term.count)}</span>
                  <span className="trend">{getTrendIcon(term.trend)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="insight-card">
            <h3>Trending Topics 🔥</h3>
            <div className="trending-list">
              {insights?.trending_topics.slice(0, 8).map((topic /*, index*/) => ( // Commented out unused index
                <div key={topic} className="trending-item">
                  <span className="topic">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zero Result Opportunities */}
          <div className="insight-card">
            <h3>Zero Result Opportunities 💡</h3>
            <div className="opportunity-list">
              {insights?.zero_result_opportunities.slice(
                0,
                8
              ).map((query /*, index*/) => ( // Commented out unused index
                <div key={query} className="opportunity-item">
                  <span className="query">&quot;{query}&quot;</span>
                  <span className="suggestion">Consider creating templates for this query</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zero Result Queries */}
          <div className="insight-card">
            <h3>Queries with No Results</h3>
            <div className="zero-results-list">
              {analytics?.zero_result_queries.slice(0, 8).map((item /*, index*/) => ( // Commented out unused index
                <div key={item.query} className="zero-result-item">
                  <span className="query">&quot;{item.query}&quot;</span>
                  <span className="count">{item.count} searches</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .search-analytics-dashboard {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #1f2937;
        }

        .controls {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .date-range-selector, .timeframe-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-range-selector input, .timeframe-selector select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .summary-card .metric {
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
        }

        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }

        .chart-container {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chart-container h3 {
          margin: 0 0 20px 0;
          color: #1f2937;
          font-size: 18px;
        }

        .insights-section {
          margin-bottom: 30px;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .insight-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .insight-card h3 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }

        .popular-term {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .popular-term:last-child {
          border-bottom: none;
        }

        .popular-term .rank {
          font-weight: bold;
          color: #6b7280;
          min-width: 30px;
        }

        .popular-term .query {
          flex: 1;
          color: #1f2937;
        }

        .popular-term .count {
          color: #6b7280;
          font-size: 14px;
        }

        .popular-term .trend {
          font-size: 16px;
        }

        .trending-item, .opportunity-item, .zero-result-item {
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .trending-item:last-child, .opportunity-item:last-child, .zero-result-item:last-child {
          border-bottom: none;
        }

        .opportunity-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .opportunity-item .suggestion {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }

        .zero-result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .zero-result-item .count {
          font-size: 12px;
          color: #6b7280;
        }

        .loading, .error {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .retry-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 15px;
        }

        .retry-button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};