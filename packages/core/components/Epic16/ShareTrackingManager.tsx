/**
 * Epic 16 Share Tracking Manager - E16-1753114247031-54ED13
 * 
 * Comprehensive share tracking and analytics system for monitoring template
 * distribution, engagement metrics, and conversion analytics across all platforms.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  CursorArrowRippleIcon,
  BanknotesIcon,
  CalendarIcon,
  FunnelIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  DocumentArrowDownIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  ChartPieIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FaceSmileIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ShareRecord } from './SocialPlatformIntegration';
import { Template } from './TemplatePreviewModal';

// Share Tracking Interfaces

}
export interface ShareTrackingManagerProps {
  templateId: string;
  template?: Template;
  shares?: ShareRecord;
  onShareUpdate?: (share: ShareRecord) => void;
  onAnalyticsRefresh?: () => void;
  className?: string;
  realTimeUpdates?: boolean;
  showAdvancedMetrics?: boolean;
}
}
}
export interface ShareTrackingData {
  totalShares: number;
  platformBreakdown: Record<string, PlatformShareData>;
  timeSeriesData: TimeSeriesPoint;
  conversionFunnel: ConversionFunnelData;
  demographicInsights: DemographicAnalysis;
  performanceMetrics: AggregatedMetrics;
  alerts: ShareAlert;
  recommendations: ShareRecommendation;
}
}
}
export interface PlatformShareData {
  platform: string;
  totalShares: number;
  successRate: number;
  averageEngagement: number;
  revenueGenerated: number;
  topPerformingContent: string;
  trends: TrendData;
}
}
}
export interface TimeSeriesPoint {
  timestamp: Date;
  shares: number;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  platform?: string;
}
}
}
export interface ConversionFunnelData {
  awareness: FunnelStage;
  interest: FunnelStage;
  consideration: FunnelStage;
  purchase: FunnelStage;
  advocacy: FunnelStage;
}
}
}
export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropOffRate: number;
  averageTime: number;
}
}
}
export interface DemographicAnalysis {
  topAgeGroups: { group: string; percentage: number; engagement: number }[];
  topLocations: { location: string; shares: number; revenue: number }[];
  topInterests: { interest: string; affinity: number; conversion: number }[];
  devicePreferences: { device: string; usage: number; performance: number }[];
}
}
export interface AggregatedMetrics {
  totalReach: number;
  engagementRate: number;
  clickThroughRate: number;
  conversionRate: number;
  viralCoefficient: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  returnOnInvestment: number;
}
}
}
export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  significance: 'high' | 'medium' | 'low';
  period: string;
}
}
}
export interface ShareAlert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  platform?: string;
  actionRequired: boolean;
  dismissed: boolean;
}
}
}
export interface ShareRecommendation {
  id: string;
  type: 'content' | 'timing' | 'platform' | 'targeting';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  confidence: number;
}
}
}
export interface ShareTrackingFilters {
  dateRange: { start: Date; end: Date };
  platforms: string;
  shareTypes: string;
  minEngagement: number;
  regions: string;
  devices: string;

// Utility functions
}
export const ShareTrackingUtils = {
  calculateTrend: (current: number, previous: number): TrendData => {,
  const change = ((current - previous) / previous) * 100;
  return {
  direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
  percentage: Math.abs(change),
  significance: Math.abs(change) > 20 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low',
  period: '7d',
};
  },
  aggregateShareData: (shares: ShareRecord): ShareTrackingData => {,
    const platformBreakdown: Record<string, PlatformShareData> = {};
    const timeSeriesData: TimeSeriesPoint = [];
    let totalRevenue = 0;
    let totalViews = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    // Process each share
    shares.forEach(share => {)
  if (!platformBreakdown[share.platform]) {
        platformBreakdown[share.platform] = {
          platform: share.platform,
          totalShares: 0,
          successRate: 0,
          averageEngagement: 0,
          revenueGenerated: 0,
          topPerformingContent: '',
          trends: { direction: 'stable', percentage: 0, significance: 'low', period: '7d' }
        };
      const platformData = platformBreakdown[share.platform];
      platformData.totalShares++;
      platformData.revenueGenerated += share.analytics.revenue;
      totalRevenue += share.analytics.revenue;
      totalViews += share.analytics.views;
      totalClicks += share.analytics.clicks;
      totalConversions += share.analytics.conversions;
      // Create time series point
      timeSeriesData.push({)
  timestamp: share.timestamp,
  shares: 1,
  views: share.analytics.views,
  clicks: share.analytics.clicks,
  conversions: share.analytics.conversions,
  revenue: share.analytics.revenue,
  platform: share.platform,
});
    });
    // Calculate success rates and averages
    Object.values(platformBreakdown).forEach(platformData => {)
  const platformShares = shares.filter(s => s.platform === platformData.platform);
      const successfulShares = platformShares.filter(s => s.success);
      platformData.successRate = (successfulShares.length / platformShares.length) * 100;
      platformData.averageEngagement = platformShares.reduce((sum, s) => sum + s.analytics.engagements, 0) / platformShares.length;
    });
    // Generate mock insights and recommendations
    const alerts: ShareAlert = [
      {
  id: 'high_performance',
  type: 'success',
  title: 'High Performance Alert',
  message: 'Twitter shares are performing 150% above average',
  timestamp: new Date(),
  platform: 'twitter',
  actionRequired: false,
  dismissed: false,
}
      {
  id: 'low_conversion',
  type: 'warning',
  title: 'Low Conversion Rate',
  message: 'LinkedIn shares have low conversion rate this week',
  timestamp: new Date(),
  platform: 'linkedin',
  actionRequired: true,
  dismissed: false];
  const recommendations: ShareRecommendation = [
  {
  id: 'optimal_timing',
  type: 'timing',
  priority: 'high',
  title: 'Optimize Posting Times',
  description: 'Post on Twitter between 9-11 AM for 40% higher engagement',
  impact: '+40% engagement',
  effort: 'low',
  confidence: 0.85,
}
      {
        id: 'platform_focus',
        type: 'platform',
        priority: 'medium',
        title: 'Focus on High-Performing Platforms',
        description: 'Allocate more resources to Twitter and LinkedIn for better ROI',
        impact: '+25% revenue',
        effort: 'medium',
        confidence: 0.72];
    return {
      totalShares: shares.length,
      platformBreakdown,
      timeSeriesData,
      conversionFunnel: {
  awareness: { stage: 'awareness', count: totalViews, percentage: 100, dropOffRate: 0, averageTime: 5 },
        interest: { stage: 'interest', count: totalClicks, percentage: (totalClicks / totalViews) * 100, dropOffRate: 75, averageTime: 30 },
        consideration: { stage: 'consideration', count: Math.floor(totalClicks * 0.6), percentage: 15, dropOffRate: 40, averageTime: 120 },
        purchase: { stage: 'purchase', count: totalConversions, percentage: 5, dropOffRate: 67, averageTime: 300 },
        advocacy: { stage: 'advocacy', count: Math.floor(totalConversions * 0.2), percentage: 1, dropOffRate: 80, averageTime: 600 }
  },
  demographicInsights: {
  topAgeGroups: [,
          { group: '25-34', percentage: 45, engagement: 8.2 },
          { group: '35-44', percentage: 30, engagement: 7.8 },
          { group: '18-24', percentage: 25, engagement: 9.1 }
        ],
        topLocations: [,
          { location: 'United States', shares: Math.floor(shares.length * 0.6), revenue: totalRevenue * 0.65 },
          { location: 'United Kingdom', shares: Math.floor(shares.length * 0.15), revenue: totalRevenue * 0.18 },
          { location: 'Canada', shares: Math.floor(shares.length * 0.1), revenue: totalRevenue * 0.12 }
        ],
        topInterests: [,
          { interest: 'AI & Technology', affinity: 9.2, conversion: 12.5 },
          { interest: 'Productivity', affinity: 8.7, conversion: 10.8 },
          { interest: 'Business Tools', affinity: 8.1, conversion: 9.2 }
        ],
        devicePreferences: [,
          { device: 'Desktop', usage: 60, performance: 8.5 },
          { device: 'Mobile', usage: 35, performance: 7.2 },
          { device: 'Tablet', usage: 5, performance: 6.8 }
        ]
  },
  performanceMetrics: {
  totalReach: totalViews,
  engagementRate: shares.length > 0 ? shares.reduce((sum, s) => sum + s.analytics.performance.engagementRate, 0) / shares.length : 0,
  clickThroughRate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
  conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
  viralCoefficient: 1.2,
  customerAcquisitionCost: totalConversions > 0 ? (totalRevenue * 0.3) / totalConversions : 0,
  lifetimeValue: totalConversions > 0 ? totalRevenue / totalConversions : 0,
  returnOnInvestment: 250,
}
      alerts,
      recommendations
    };
  },
  formatMetric: (value: number, type: 'currency' | 'percentage' | 'number'): string => {
    switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;}
    case 'number':
      return value.toLocaleString();
    default:
      return value.toString();
};

// Main component
export const ShareTrackingManager: React.FC<ShareTrackingManagerProps> = ({)
  templateId,
  template,
  shares = [],
  onShareUpdate,
  onAnalyticsRefresh,
  className = '',
  realTimeUpdates = true,
  showAdvancedMetrics = true
}) => {
  const [trackingData, setTrackingData] = useState<ShareTrackingData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'demographics' | 'funnel' | 'alerts'>('overview');
  const [filters, _____setFilters] = useState<ShareTrackingFilters>({)
  dateRange: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
    platforms: [],
    shareTypes: [],
    minEngagement: 0,
    regions: [],
    devices: [];
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string>([]);
  // Process share data
  useEffect(() => {
    if (shares.length > 0) {
      const processed = ShareTrackingUtils.aggregateShareData(shares);
      setTrackingData(processed);
  }, [shares]);
  // Real-time updates simulation
  useEffect(() => {
  if (!realTimeUpdates || !trackingData) return;
  const interval = setInterval(() => {
  // Simulate real-time data updates
  setTrackingData(prev => {)
  if (!prev) return null;
  return {
  ...prev,
  performanceMetrics: {
  ...prev.performanceMetrics,
  totalReach: prev.performanceMetrics.totalReach + Math.floor(Math.random() * 10),
  engagementRate: prev.performanceMetrics.engagementRate + (Math.random() - 0.5) * 0.1,
};
      });
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [realTimeUpdates, trackingData]);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onAnalyticsRefresh?.();
    } finally {
      setIsRefreshing(false);
  }, [onAnalyticsRefresh]);
  const handleAlertDismiss = useCallback((alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  }, []);
  const _____filteredShares = useMemo(() => {
    return shares.filter(share => {)
  const inDateRange = share.timestamp >= filters.dateRange.start && share.timestamp <= filters.dateRange.end;
      const matchesPlatform = filters.platforms.length === 0 || filters.platforms.includes(share.platform);
      const matchesEngagement = share.analytics.engagements >= filters.minEngagement;
      return inDateRange && matchesPlatform && matchesEngagement;
    });
  }, [shares, filters]);
  const activeAlerts = useMemo(() => {
    return trackingData?.alerts.filter(alert => !dismissedAlerts.includes(alert.id)) || [];
  }, [trackingData?.alerts, dismissedAlerts]);
  if (!trackingData) {
    return;
      <div className={`bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`}>}
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Share Data Available</h3>
        <p className="text-gray-600">Start sharing your template to see analytics and tracking data.</p>
      </div>
    );
  return;
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>}
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Share Tracking & Analytics</h3>
              <p className="text-sm text-gray-600">
                {template?.title || `Template ${templateId}`} • {trackingData.totalShares} total shares}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-sm disabled:opacity-50"
            >
              <ArrowTrendingUpIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
              Refresh
            </button>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {realTimeUpdates && ()
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Alerts */}
      {activeAlerts.length > 0 && ()
        <div className="border-b border-gray-200 p-4 bg-yellow-50">
          <div className="space-y-2">
            {activeAlerts.slice(0, 3).map(alert => {)
  const AlertIcon = alert.type === 'success' ? CheckCircleIcon :,;
  alert.type === 'warning' ? ExclamationTriangleIcon :,
  alert.type === 'error' ? XCircleIcon : InformationCircleIcon;
  const alertColors = {
  success: 'text-green-600 bg-green-100',
  warning: 'text-yellow-600 bg-yellow-100',
  error: 'text-red-600 bg-red-100',
  info: 'text-blue-600 bg-blue-100',
};
              return;
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${alertColors[alert.type]}`}>}
                  <AlertIcon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm opacity-90">{alert.message}</div>
                  </div>
                  <button
                    onClick={() => handleAlertDismiss(alert.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Key Metrics */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{trackingData.totalShares}</div>
            <div className="text-xs text-gray-600">Total Shares</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{trackingData.performanceMetrics.totalReach.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total Reach</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{trackingData.performanceMetrics.clickThroughRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">CTR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{trackingData.performanceMetrics.conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{trackingData.performanceMetrics.engagementRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {ShareTrackingUtils.formatMetric()
                Object.values(trackingData.platformBreakdown).reduce((sum, p) => sum + p.revenueGenerated, 0),
                'currency'
              )}
            </div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex px-4">
          {[
            { id: 'overview', label: 'Overview', icon: Squares2X2Icon },
            { id: 'platforms', label: 'Platforms', icon: GlobeAltIcon },
            { id: 'demographics', label: 'Demographics', icon: UserGroupIcon },
            { id: 'funnel', label: 'Funnel', icon: FunnelIcon },
            { id: 'alerts', label: 'Alerts', icon: FlagIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return;
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
  activeTab === tab.id
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'alerts' && activeAlerts.length > 0 && ()
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                    {activeAlerts.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && ()
          <div className="space-y-6">
            {/* Performance Trends */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Performance Overview</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-700">Engagement Rate</h5>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ArrowUpIcon className="h-3 w-3" />
                      +12.5%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {trackingData.performanceMetrics.engagementRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">vs. last period</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-700">Viral Coefficient</h5>
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <TrendingUpIcon className="h-3 w-3" />
                      {trackingData.performanceMetrics.viralCoefficient.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {trackingData.performanceMetrics.viralCoefficient.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">shares per user</div>
                </div>
              </div>
            </div>
            {/* Top Recommendations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Recommendations</h4>
              <div className="space-y-3">
                {trackingData.recommendations.slice(0, 3).map(rec => ()
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
  rec.priority === 'high' ? 'bg-red-100 text-red-700' :,
  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :,
  'bg-blue-100 text-blue-700'
}`}>
                            {rec.priority} priority
                          </span>
                          <span className="text-xs text-gray-500">{rec.type}</span>
                        </div>
                        <h5 className="font-medium text-gray-900 mb-1">{rec.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Impact: {rec.impact}</span>
                          <span>Effort: {rec.effort}</span>
                          <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <SparklesIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'platforms' && ()
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Platform Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(trackingData.platformBreakdown).map(platform => ()
                <div key={platform.platform} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 capitalize">{platform.platform}</h5>
                    <div className={`flex items-center gap-1 text-xs ${
  platform.trends.direction === 'up' ? 'text-green-600' :,
  platform.trends.direction === 'down' ? 'text-red-600' :,
  'text-gray-600'
}`}>
                      {platform.trends.direction === 'up' ? <TrendingUpIcon className="h-3 w-3" /> :
                        platform.trends.direction === 'down' ? <TrendingDownIcon className="h-3 w-3" /> : null}
                      {platform.trends.percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shares:</span>
                      <span className="font-medium">{platform.totalShares}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium">{platform.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg. Engagement:</span>
                      <span className="font-medium">{platform.averageEngagement.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">{ShareTrackingUtils.formatMetric(platform.revenueGenerated, 'currency')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'demographics' && ()
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Demographic Insights</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Groups */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-4">Top Age Groups</h5>
                <div className="space-y-3">
                  {trackingData.demographicInsights.topAgeGroups.map((group, index) => ()
                    <div key={group.group} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{group.group} years</div>
                          <div className="text-xs text-gray-500">Engagement: {group.engagement.toFixed(1)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{group.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Top Locations */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-4">Top Locations</h5>
                <div className="space-y-3">
                  {trackingData.demographicInsights.topLocations.map((location, index) => ()
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{location.location}</div>
                          <div className="text-xs text-gray-500">{location.shares} shares</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {ShareTrackingUtils.formatMetric(location.revenue, 'currency')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Device Preferences */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-4">Device Preferences</h5>
                <div className="space-y-3">
                  {trackingData.demographicInsights.devicePreferences.map(device => {)
  const DeviceIcon = device.device === 'Mobile' ? DevicePhoneMobileIcon : ComputerDesktopIcon;
                    return;
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DeviceIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{device.device}</div>
                            <div className="text-xs text-gray-500">Performance: {device.performance.toFixed(1)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{device.usage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Top Interests */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-4">Top Interests</h5>
                <div className="space-y-3">
                  {trackingData.demographicInsights.topInterests.map(interest => ()
                    <div key={interest.interest} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div>
                          <div className="font-medium text-gray-900">{interest.interest}</div>
                          <div className="text-xs text-gray-500">Conversion: {interest.conversion.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{interest.affinity.toFixed(1)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'funnel' && ()
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Conversion Funnel</h4>
            <div className="relative">
              {Object.values(trackingData.conversionFunnel).map((stage, index) => ()
                <div key={stage.stage} className="relative mb-4">
                  <div 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg"
                    style={{ 
                      width: `${Math.max(stage.percentage, 10)}%`}
},
  minWidth: '200px'
  }}
                  >
                    <div>
                      <div className="font-semibold capitalize">{stage.stage}</div>
                      <div className="text-sm opacity-90">{stage.count.toLocaleString()} users</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{stage.percentage.toFixed(1)}%</div>
                      {index > 0 && ()
                        <div className="text-xs opacity-75">-{stage.dropOffRate}% drop</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 ml-4 text-xs text-gray-500">
                    Avg. time: {Math.floor(stage.averageTime / 60)}m {stage.averageTime % 60}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'alerts' && ()
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Alerts & Notifications</h4>
              <div className="text-sm text-gray-600">
                {activeAlerts.length} active alerts
              </div>
            </div>
            <div className="space-y-4">
              {trackingData.alerts.map(alert => {)
  const AlertIcon = alert.type === 'success' ? CheckCircleIcon :,;
  alert.type === 'warning' ? ExclamationTriangleIcon :,
  alert.type === 'error' ? XCircleIcon : InformationCircleIcon;
  const alertColors = {
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};
                const isDismissed = dismissedAlerts.includes(alert.id);
                return;
                  <div 
                    key={alert.id} 
                    className={`border rounded-lg p-4 ${isDismissed ? 'opacity-50' : ''} ${alertColors[alert.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium">{alert.title}</h5>
                          <div className="text-xs opacity-75">
                            {alert.timestamp.toLocaleDateString()} {alert.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            {alert.platform && ()
                              <span className="px-2 py-1 bg-white bg-opacity-20 rounded capitalize">
                                {alert.platform}
                              </span>
                            )}
                            {alert.actionRequired && ()
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                Action Required
                              </span>
                            )}
                          </div>
                          {!isDismissed && ()
                            <button
                              onClick={() => handleAlertDismiss(alert.id)}
                              className="text-xs hover:underline opacity-75 hover:opacity-100"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {trackingData.alerts.length === 0 && ()
              <div className="text-center py-8 text-gray-500">
                <FaceSmileIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h5 className="font-medium text-gray-700 mb-2">All Good!</h5>
                <p className="text-sm">No alerts or issues to report at this time.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareTrackingManager;