// Epic 16 Story 16.2 - Comprehensive Creator Dashboard
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart,
  Line,
  BarChart,
  Bar,
  // PieChart,
  // Pie,
  // Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/environment';
interface CreatorStats {
  total_templates: number;,
  active_templates: number;
  total_revenue_cents: number;,
  total_purchases: number;
  avg_rating: number;,
  total_reviews: number;
  total_views: number;,
  conversion_rate: number;
  interface Template {
  id: string;,
  title: string;
  status: 'draft' | 'listed' | 'blocked' | 'archived';,
  price_cents: number;
  total_purchases: number;,
  total_revenue: number;
  avg_rating: number;,
  total_reviews: number;
  total_views: number;,
  created_at: string;
  updated_at: string;
  interface MonetizationSettings {
  payout_threshold_cents: number;,
  payout_schedule: 'weekly' | 'monthly';
  payment_method: 'stripe' | 'paypal' | 'bank_transfer';,
  tax_settings: {,
  tax_id?: string;
  business_name?: string;
  address: string;,
  city: string;
  country: string;,
  tax_exempt: boolean;
};
interface CreatorProfile {
  id: string;,
  display_name: string;
  bio?: string;
  website?: string;
  social_links: Record<string, string>;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';,
  creator_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  badges: string;,
  public_profile: boolean;
  export const [templates, setTemplates] = useState<Template>([]);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [monetization, setMonetization] = useState<MonetizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'analytics' | 'monetization' | 'profile'>('overview');
  const [dateRange, setDateRange] = useState({)
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0],
});
  const navigate = useNavigate();
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })}
    };
  }, []);
  const fetchCreatorData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, templatesRes, profileRes, monetizationRes] = await Promise.all([)
        fetch(`${API_URL}/api/marketplace/creator/stats?start_date=${dateRange.start}&end_date=${dateRange.end}`, {)}
  },
  headers: getAuthHeaders();
  }),
        fetch(`${API_URL}/api/marketplace/creator/templates`, {)}
  },
  headers: getAuthHeaders();
  }),
        fetch(`${API_URL}/api/marketplace/creator/profile`, {)}
  },
  headers: getAuthHeaders();
  }),
        fetch(`${API_URL}/api/marketplace/creator/monetization`, {)}
  },
  headers: getAuthHeaders();
  }
      ]);
      if (!statsRes.ok || !templatesRes.ok || !profileRes.ok || !monetizationRes.ok) {
        throw new Error('Failed to fetch creator data');
      const [statsData, templatesData, profileData, monetizationData] = await Promise.all([)
        statsRes.json(),
        templatesRes.json(),
        profileRes.json(),
        monetizationRes.json()
      ]);
      setStats(statsData);
      setTemplates(templatesData.templates || []);
      setProfile(profileData);
      setMonetization(monetizationData);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to fetch creator data');
} finally {
      setLoading(false);
  }, [dateRange, getAuthHeaders]);
  useEffect(() => {
    fetchCreatorData();
  }, [dateRange, fetchCreatorData]);
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;}
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;}
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;}
    return num.toString();
  };
  const getStatusColor = (status: string) => {
  switch (status) {
  case 'listed': return '#22c55e';
  case 'draft': return '#6b7280';
  case 'blocked': return '#ef4444';
  case 'archived': return '#9ca3af';
  default: return '#6b7280';
};
  const getVerificationBadge = (status: string) => {
  switch (status) {
  case 'verified': return '✅ Verified Creator';
  case 'pending': return '🔄 Verification Pending';
  case 'rejected': return '❌ Verification Rejected';
  default: return '📋 Unverified';
};
  const getTierBadge = (tier: string) => {
  const tierMap = {
  bronze: '🥉 Bronze Creator',
  silver: '🥈 Silver Creator',
  gold: '🥇 Gold Creator',
  platinum: '💎 Platinum Creator',
};
    return tierMap[tier as keyof typeof tierMap] || '📝 New Creator';
  };
  if (loading) {
    return;
      <div className="creator-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading creator dashboard...</p>
        </div>
      </div>
    );
  if (error) {
    return;
      <div className="creator-dashboard error">
        <div className="error-message">
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchCreatorData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  return;
    <div className="creator-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="creator-info">
          <h1>Creator Dashboard</h1>
          <div className="creator-badges">
            <span className="verification-badge">{getVerificationBadge(profile?.verification_status || 'unverified')}</span>
            <span className="tier-badge">{getTierBadge(profile?.creator_tier || 'bronze')}</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/marketplace/templates/create')}
            className="create-template-btn"
          >
            + Create Template
          </button>
          <div className="date-range-selector">
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
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        {['overview', 'templates', 'analytics', 'monetization', 'profile'].map(tab => ()
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as 'overview' | 'templates' | 'analytics' | 'monetization' | 'profile')}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && ()
          <div className="overview-tab">
            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card revenue">
                <h3>Total Revenue</h3>
                <div className="metric-value">{formatCurrency(stats?.total_revenue_cents || 0)}</div>
                <div className="metric-label">From {stats?.total_purchases || 0} purchases</div>
              </div>
              <div className="metric-card templates">
                <h3>Active Templates</h3>
                <div className="metric-value">{stats?.active_templates || 0}</div>
                <div className="metric-label">of {stats?.total_templates || 0} total</div>
              </div>
              <div className="metric-card rating">
                <h3>Average Rating</h3>
                <div className="metric-value">{(stats?.avg_rating || 0).toFixed(1)} ⭐</div>
                <div className="metric-label">From {stats?.total_reviews || 0} reviews</div>
              </div>
              <div className="metric-card conversion">
                <h3>Conversion Rate</h3>
                <div className="metric-value">{((stats?.conversion_rate || 0) * 100).toFixed(1)}%</div>
                <div className="metric-label">From {formatNumber(stats?.total_views || 0)} views</div>
              </div>
            </div>
            {/* Recent Templates Performance */}
            <div className="recent-performance">
              <h3>Top Performing Templates</h3>
              <div className="templates-table">
                <div className="table-header">
                  <div>Template</div>
                  <div>Status</div>
                  <div>Revenue</div>
                  <div>Purchases</div>
                  <div>Rating</div>
                  <div>Views</div>
                </div>
                {templates.slice(0, 5).map(template => ()
                  <div key={template.id} className="table-row">
                    <div className="template-info">
                      <span className="template-title">{template.title}</span>
                      <span className="template-price">{formatCurrency(template.price_cents)}</span>
                    </div>
                    <div>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(template.status) }}
                      >
                        {template.status}
                      </span>
                    </div>
                    <div>{formatCurrency(template.total_revenue)}</div>
                    <div>{template.total_purchases}</div>
                    <div>{template.avg_rating.toFixed(1)} ⭐</div>
                    <div>{formatNumber(template.total_views)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'templates' && ()
          <div className="templates-tab">
            <div className="templates-header">
              <h3>Your Templates ({templates.length})</h3>
              <div className="templates-filters">
                <select className="status-filter">
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="listed">Listed</option>
                  <option value="blocked">Blocked</option>
                  <option value="archived">Archived</option>
                </select>
                <button onClick={() => navigate('/marketplace/templates/create')}>
                  + New Template
                </button>
              </div>
            </div>
            <div className="templates-grid">
              {templates.map(template => ()
                <div key={template.id} className="template-card">
                  <div className="card-header">
                    <h4>{template.title}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(template.status) }}
                    >
                      {template.status}
                    </span>
                  </div>
                  <div className="card-metrics">
                    <div className="metric">
                      <span className="value">{formatCurrency(template.total_revenue)}</span>
                      <span className="label">Revenue</span>
                    </div>
                    <div className="metric">
                      <span className="value">{template.total_purchases}</span>
                      <span className="label">Sales</span>
                    </div>
                    <div className="metric">
                      <span className="value">{template.avg_rating.toFixed(1)} ⭐</span>
                      <span className="label">Rating</span>
                    </div>
                    <div className="metric">
                      <span className="value">{formatNumber(template.total_views)}</span>
                      <span className="label">Views</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => navigate(`/marketplace/templates/${template.id}/edit`)}>}
                      Edit
                    </button>
                    <button onClick={() => navigate(`/marketplace/templates/${template.id}/analytics`)}>}
                      Analytics
                    </button>
                    <button onClick={() => navigate(`/marketplace/templates/${template.id}`)}>}
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'analytics' && ()
          <div className="analytics-tab">
            <div className="analytics-charts">
              {/* Revenue Trend */}
              <div className="chart-container">
                <h3>Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Template Performance */}
              <div className="chart-container">
                <h3>Template Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={templates.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_purchases" fill="#8884d8" name="Purchases" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'monetization' && ()
          <div className="monetization-tab">
            <div className="monetization-settings">
              <h3>Monetization Settings</h3>
              <div className="settings-section">
                <h4>Payout Configuration</h4>
                <div className="setting-row">
                  <label>Payout Threshold</label>
                  <input 
                    type="number" 
                    value={(monetization?.payout_threshold_cents || 5000) / 100}
                    onChange={() => {/* Handle threshold change */}}
                    placeholder="50.00"
                  />
                  <span>USD</span>
                </div>
                <div className="setting-row">
                  <label>Payout Schedule</label>
                  <select value={monetization?.payout_schedule || 'monthly'}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="setting-row">
                  <label>Payment Method</label>
                  <select value={monetization?.payment_method || 'stripe'}>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="settings-section">
                <h4>Tax Information</h4>
                <div className="setting-row">
                  <label>Business Name</label>
                  <input 
                    type="text" 
                    value={monetization?.tax_settings.business_name || ''}
                    placeholder="Your Business Name"
                  />
                </div>
                <div className="setting-row">
                  <label>Tax ID</label>
                  <input 
                    type="text" 
                    value={monetization?.tax_settings.tax_id || ''}
                    placeholder="Tax ID / EIN"
                  />
                </div>
                <div className="setting-row">
                  <label>Address</label>
                  <textarea 
                    value={monetization?.tax_settings.address || ''}
                    rows={3}
                    placeholder="Business Address"
                  />
                </div>
              </div>
              <button className="save-settings-btn">Save Settings</button>
            </div>
          </div>
        )}
        {activeTab === 'profile' && ()
          <div className="profile-tab">
            <div className="profile-settings">
              <h3>Creator Profile</h3>
              <div className="profile-section">
                <h4>Public Information</h4>
                <div className="setting-row">
                  <label>Display Name</label>
                  <input 
                    type="text" 
                    value={profile?.display_name || ''}
                    placeholder="Your Creator Name"
                  />
                </div>
                <div className="setting-row">
                  <label>Bio</label>
                  <textarea 
                    value={profile?.bio || ''}
                    rows={4}
                    placeholder="Tell users about yourself and your expertise..."
                  />
                </div>
                <div className="setting-row">
                  <label>Website</label>
                  <input 
                    type="url" 
                    value={profile?.website || ''}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="setting-row">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={profile?.public_profile || false}
                    />
                    Make profile public
                  </label>
                </div>
              </div>
              <div className="profile-section">
                <h4>Social Links</h4>
                <div className="social-links">
                  <div className="setting-row">
                    <label>Twitter</label>
                    <input 
                      type="text" 
                      value={profile?.social_links.twitter || ''}
                      placeholder="@username"
                    />
                  </div>
                  <div className="setting-row">
                    <label>LinkedIn</label>
                    <input 
                      type="url" 
                      value={profile?.social_links.linkedin || ''}
                      placeholder="LinkedIn profile URL"
                    />
                  </div>
                  <div className="setting-row">
                    <label>GitHub</label>
                    <input 
                      type="text" 
                      value={profile?.social_links.github || ''}
                      placeholder="GitHub username"
                    />
                  </div>
                </div>
              </div>
              <button className="save-profile-btn">Save Profile</button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .creator-dashboard {
          max-width: 1400px;,
  margin: 0 auto;
          padding: 20px;
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        .creator-info h1 {
          margin: 0 0 10px 0;,
  color: #1f2937;
        .creator-badges {
          display: flex;,
  gap: 10px;
        .verification-badge, .tier-badge {
          background: #f3f4f6;,
  padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        .header-actions {
          display: flex;
          align-items: center;,
  gap: 15px;
        .create-template-btn {
          background: #3b82f6;,
  color: white;
          border: none;,
  padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;,
  cursor: pointer;
        .create-template-btn:hover {,
  background: #2563eb;
        .date-range-selector {
          display: flex;
          align-items: center;,
  gap: 8px;
        .date-range-selector input {
          padding: 8px 12px;,
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        .dashboard-tabs {
          display: flex;,
  gap: 2px;
          margin-bottom: 30px;
          border-bottom: 2px solid #e1e5e9;
        .tab {
          background: none;,
  border: none;
          padding: 12px 20px;,
  cursor: pointer;
          color: #6b7280;
          font-weight: 500;
          border-bottom: 2px solid transparent;
        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        .tab:hover {,
  color: #1f2937;
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        .metric-card {
          background: white;,
  padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        .metric-card h3 {
          margin: 0 0 10px 0;,
  color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        .metric-value {
          font-size: 32px;
          font-weight: bold;,
  color: #1f2937;
          margin-bottom: 5px;
        .metric-label {
          font-size: 12px;,
  color: #6b7280;
        .recent-performance {
          background: white;,
  padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        .recent-performance h3 {
          margin: 0 0 20px 0;,
  color: #1f2937;
        .templates-table {
          display: flex;
          flex-direction: column;,
  gap: 1px;
        .table-header, .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;,
  gap: 20px;
          padding: 12px 0;
        .table-header {
          font-weight: 600;,
  color: #6b7280;
          border-bottom: 1px solid #e1e5e9;
        .table-row {
          border-bottom: 1px solid #f3f4f6;
        .template-info {
          display: flex;
          flex-direction: column;
        .template-title {
          font-weight: 500;
        .template-price {
          font-size: 12px;,
  color: #6b7280;
        .status-badge {
          display: inline-block;,
  padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;,
  color: white;
        .templates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        .templates-filters {
          display: flex;,
  gap: 10px;
          align-items: center;
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        .template-card {
          background: white;,
  padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        .card-header h4 {
          margin: 0;,
  color: #1f2937;
        .card-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 15px;
        .card-metrics .metric {
          text-align: center;
        .card-metrics .value {
          display: block;
          font-size: 18px;
          font-weight: bold;,
  color: #1f2937;
        .card-metrics .label {
          font-size: 12px;,
  color: #6b7280;
        .card-actions {
          display: flex;,
  gap: 8px;
        .card-actions button {
          flex: 1;,
  padding: 8px 12px;
          border: 1px solid #d1d5db;,
  background: white;
          border-radius: 6px;,
  cursor: pointer;
          font-size: 12px;
        .card-actions button:hover {,
  background: #f9fafb;
        .analytics-charts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 30px;
        .chart-container {
          background: white;,
  padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        .chart-container h3 {
          margin: 0 0 20px 0;,
  color: #1f2937;
        .monetization-settings, .profile-settings {
          background: white;,
  padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 600px;
        .settings-section, .profile-section {
          margin-bottom: 30px;
        .settings-section h4, .profile-section h4 {
          margin: 0 0 15px 0;,
  color: #1f2937;
          font-size: 16px;
        .setting-row {
          display: flex;
          align-items: center;,
  gap: 15px;
          margin-bottom: 15px;
        .setting-row label {
          min-width: 120px;
          font-weight: 500;,
  color: #374151;
        .setting-row input, .setting-row select, .setting-row textarea {
          flex: 1;,
  padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        .save-settings-btn, .save-profile-btn {
          background: #3b82f6;,
  color: white;
          border: none;,
  padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;,
  cursor: pointer;
        .save-settings-btn:hover, .save-profile-btn:hover {,
  background: #2563eb;
        .loading, .error {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        .loading-spinner {
          text-align: center;
        .spinner {
          width: 40px;,
  height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;,
  animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        .error-message {
          text-align: center;,
  padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        .retry-button {
          background: #3b82f6;,
  color: white;
          border: none;,
  padding: 10px 20px;
          border-radius: 6px;,
  cursor: pointer;
          margin-top: 15px;
        .retry-button:hover {,
  background: #2563eb;
      `}</style>
    </div>
  );
};