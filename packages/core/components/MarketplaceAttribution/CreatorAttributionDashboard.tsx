/**
 * Epic 16 Creator Attribution Dashboard
 * Task: E16-1753114247138-03634F - Add attribution system
 * 
 * Comprehensive dashboard for template creators to manage their attribution,
 * revenue sharing, collaborations, and attribution claims.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  DollarSign,
  FileText,
  Award,
  TrendingUp,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Edit,
  Eye,
  Share2
} from 'lucide-react';
import {
  CreatorDashboardResponse,
  TemplateAttributionResponse,
  MarketplaceAttributionAnalytics
} from '../../types/marketplaceAttribution';

// =============================================================================
// Component Types
// =============================================================================

export interface CreatorAttributionDashboardProps {
  userId: string;
  onTemplateClick?: (templateId: string) => void;
  onCollaborationClick?: (templateId: string) => void;
  onSettingsClick?: () => void;
  className?: string;
  interface DashboardStats {
  totalTemplates: number;,
  totalRevenue: number;
  pendingRevenue: number;,
  collaborations: number;
  activeClaims: number;,
  verificationRate: number;
  interface TemplatePerformance {
  templateId: string;,
  title: string;
  views: number;,
  purchases: number;
  revenue: number;,
  rating: number;
  trend: 'up' | 'down' | 'stable';
  // =============================================================================
  // Creator Attribution Dashboard Component
  // =============================================================================
}
export const CreatorAttributionDashboard: React.FC<CreatorAttributionDashboardProps> = ({)
  userId,
  onTemplateClick,
  onCollaborationClick,
  onSettingsClick,
  className = ''
}) => {
  // State management
  const [dashboard, setDashboard] = useState<CreatorDashboardResponse | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topPerformers, setTopPerformers] = useState<TemplatePerformance>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'collaborations' | 'analytics'>('overview');
  // =============================================================================
  // Data Loading
  // =============================================================================
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/marketplace-attribution/creators/${userId}/dashboard`, {)}
  },
  headers: {,
          'Authorization': `Bearer ${getAuthToken()}`}
      });
      if (!response.ok) {
  throw new Error('Failed to load creator dashboard');
  const data = await response.json();
  if (data.success) {
  setDashboard(data);
  // Calculate stats
  const calculatedStats: DashboardStats = {,
  totalTemplates: data.templates.length,
  totalRevenue: data.templates.reduce((sum: number, t: unknown) => sum + t.revenue.total, 0),
  pendingRevenue: data.templates.reduce((sum: number, t: unknown) => sum + t.revenue.pending, 0),
  collaborations: data.collaborations.length,
  activeClaims: 0, // Would be calculated from claims data,
  verificationRate: data.profile.attributionReputation.accuracyScore,
};
        setStats(calculatedStats);
        // Calculate top performers
        const performers: TemplatePerformance = data.templates
          .map((template: Error) => ({,)
  templateId: template.templateId,
  title: template.title,
  views: template.performance.views,
  purchases: template.performance.purchases,
  revenue: template.revenue.total,
  rating: template.performance.rating,
  trend: template.performance.purchases > 10 ? 'up' : 'stable' as const,
}))
          .sort((a: TemplatePerformance, b: TemplatePerformance) => b.revenue - a.revenue)
          .slice(0, 5);
        setTopPerformers(performers);
      } else {
        throw new Error(data.error || 'Failed to load dashboard');
    } catch (error) {
  console.error('Failed to fetch creator dashboard:', error);
  setError(error instanceof Error ? error.message : 'Unknown error occurred');
} finally {
      setLoading(false);
  }, [userId]);
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);
  // =============================================================================
  // UI Rendering Methods
  // =============================================================================
  const renderStatsCards = () => {
  if (!stats) return null;
  const statCards = [;
  {
  icon: FileText,
  label: 'Templates Created',
  value: stats.totalTemplates.toString(),
  subtext: 'Active templates',
  color: 'blue',
}
      {
        icon: DollarSign,
        label: 'Total Revenue',
        value: `$${(stats.totalRevenue / 100).toFixed(2)}`}
},
  subtext: `$${(stats.pendingRevenue / 100).toFixed(2)} pending`}
},
  color: 'green';
  }
      {
  icon: Users,
  label: 'Collaborations',
  value: stats.collaborations.toString(),
  subtext: 'Active partnerships',
  color: 'purple',
}
      {
        icon: Award,
        label: 'Verification Rate',
        value: `${stats.verificationRate.toFixed(1)}%`}
},
  subtext: 'Attribution accuracy',
        color: 'orange'];
    return;
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => ()
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.subtext}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${card.color}-50`}>}
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderTemplatesList = () => {
    if (!dashboard?.templates) return null;
    return;
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Templates</h3>
          <p className="text-sm text-gray-500">Manage your template attributions and performance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboard.templates.map((template) => ()
                <tr key={template.templateId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.title}</div>
                        <div className="text-sm text-gray-500">ID: {template.templateId.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {template.performance.views} views
                    </div>
                    <div className="text-sm text-gray-500">
                      {template.performance.purchases} purchases
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${(template.revenue.total / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${(template.revenue.pending / 100).toFixed(2)} pending}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{template.performance.rating.toFixed(1)}</div>
                      <div className="ml-1">
                        {Array.from({ length: 5 }, (_, i) => ()
                          <span
                            key={i}
                            className={`text-xs ${
  i < Math.floor(template.performance.rating)
  ? 'text-yellow-400'
  : 'text-gray-300',
}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onTemplateClick?.(template.templateId)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/marketplace/templates/${template.templateId}`, '_blank')}
                        className="text-gray-600 hover:text-gray-900"
                        title="View in Marketplace"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const renderCollaborationsList = () => {
    if (!dashboard?.collaborations) return null;
    return;
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Collaborations</h3>
          <p className="text-sm text-gray-500">Templates you're collaborating on</p>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboard.collaborations.map((collaboration, index) => ()
            <div key={index} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">{collaboration.title}</h4>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
  collaboration.status === 'active'
  ? 'bg-green-100 text-green-800'
  : collaboration.status === 'completed',
  ? 'bg-blue-100 text-blue-800'
  : 'bg-yellow-100 text-yellow-800',
}`}>
                      {collaboration.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span>Role: {collaboration.role}</span>
                    <span className="mx-2">•</span>
                    <span>Contribution: {collaboration.contribution}%</span>
                    <span className="mx-2">•</span>
                    <span>Revenue: ${(collaboration.revenue / 100).toFixed(2)}</span>}
                  </div>
                </div>
                <button
                  onClick={() => onCollaborationClick?.(collaboration.templateId)}
                  className="ml-4 text-blue-600 hover:text-blue-900"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {dashboard.collaborations.length === 0 && ()
          <div className="px-6 py-8 text-center">
            <Users className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No collaborations yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start collaborating with other creators to expand your reach.
            </p>
          </div>
        )}
      </div>
    );
  };
  const renderTopPerformers = () => {
    if (topPerformers.length === 0) return null;
    return;
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Templates</h3>
          <p className="text-sm text-gray-500">Your highest revenue generating templates</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topPerformers.map((template, index) => ()
              <div key={template.templateId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{template.title}</p>
                    <p className="text-sm text-gray-500">
                      {template.views} views • {template.purchases} purchases
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${(template.revenue / 100).toFixed(2)}
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className={`w-4 h-4 ${
  template.trend === 'up' ? 'text-green-500' : 'text-gray-400',
}`} />
                    <span className="text-xs text-gray-500 ml-1">
                      {template.rating.toFixed(1)} ★
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const renderProfile = () => {
    if (!dashboard?.profile) return null;
    return;
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Creator Profile</h3>
            <p className="text-sm text-gray-500">Your marketplace identity and settings</p>
          </div>
          <button
            onClick={onSettingsClick}
            className="text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-blue-600">
                  {dashboard.profile.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900">{dashboard.profile.displayName}</h4>
              {dashboard.profile.profileBio && ()
                <p className="text-sm text-gray-600 mt-1">{dashboard.profile.profileBio}</p>
              )}
              <div className="flex items-center mt-3 space-x-4">
                {dashboard.profile.verificationBadges.map((badge, index) => ()
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {badge.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Collaboration Score:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {dashboard.profile.collaborationScore.toFixed(1)}/100
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Attribution Accuracy:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {dashboard.profile.attributionReputation.accuracyScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // =============================================================================
  // Main Render
  // =============================================================================
  if (loading) {
    return;
      <div className={`creator-attribution-dashboard ${className}`}>}
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading creator dashboard...</span>
        </div>
      </div>
    );
  if (error) {
    return;
      <div className={`creator-attribution-dashboard ${className}`}>}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="ml-3 text-sm font-medium text-red-800">Error Loading Dashboard</h3>
          </div>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  return;
    <div className={`creator-attribution-dashboard ${className}`}>}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Creator Attribution Dashboard</h1>
        <p className="text-gray-600">Manage your template attributions, collaborations, and revenue sharing</p>
      </div>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'collaborations', label: 'Collaborations', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: Award }
          ].map((tab) => ()
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === tab.id
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Tab Content */}
      {activeTab === 'overview' && ()
        <div className="space-y-8">
          {renderStatsCards()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderProfile()}
            {renderTopPerformers()}
          </div>
        </div>
      )}
      {activeTab === 'templates' && renderTemplatesList()}
      {activeTab === 'collaborations' && renderCollaborationsList()}
      {activeTab === 'analytics' && ()
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <Clock className="mx-auto w-12 h-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Coming Soon</h3>
          <p className="mt-1 text-sm text-gray-500">
            Detailed analytics and insights will be available soon.
          </p>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Helper Functions
// =============================================================================
function getAuthToken(): string {
  // Implementation would get JWT token from app state or localStorage
  return localStorage.getItem('authToken') || '';

export default CreatorAttributionDashboard;